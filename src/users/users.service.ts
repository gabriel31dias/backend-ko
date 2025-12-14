import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User as PrismaUser } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateFeesDto } from './dto/update-fees.dto';
import { User, WalletSnapshot } from './user.entity';
import { randomUUID } from 'crypto';
import { compare, hash } from 'bcryptjs';

const VALID_STATUSES = ['pending', 'approved', 'rejected'] as const;
const PASSWORD_SALT_ROUNDS = 10;

export interface DocumentUploadPaths {
  pfDocumentFront?: string;
  pfDocumentBack?: string;
  pfSelfieDocument?: string;
  pfBankProof?: string;
  pjLegalRepresentativeDocumentFront?: string;
  pjLegalRepresentativeDocumentBack?: string;
  pjSelfieDocument?: string;
  pjBankProof?: string;
  pjCnpjDocument?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(payload: CreateUserDto, documents: DocumentUploadPaths = {}): Promise<User> {
    const existing = await this.findByEmail(payload.email);
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const hashedPassword = await this.hashPassword(payload.password);

    const created = await this.prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email.toLowerCase(),
        phone: payload.phone,
        password: hashedPassword,
        operationType: payload.operationType,
        averageTicket: payload.averageTicket,
        cpf: payload.cpf,
        cnpj: payload.cnpj,
        corporateName: payload.corporateName,
        salesPageLink: payload.salesPageLink,
        // Campos de endereço
        addressCep: payload.address?.cep,
        addressStreet: payload.address?.street,
        addressNumber: payload.address?.number,
        addressComplement: payload.address?.complement,
        addressNeighborhood: payload.address?.neighborhood,
        addressCity: payload.address?.city,
        addressState: payload.address?.state,
        // Campos de documentos
        documentName: payload.documents?.name,
        documentCpf: payload.documents?.cpf,
        pfDocumentFrontPath: documents.pfDocumentFront,
        pfDocumentBackPath: documents.pfDocumentBack,
        pfSelfieDocumentPath: documents.pfSelfieDocument,
        pfBankProofPath: documents.pfBankProof,
        legalRepresentativeDocumentFrontPath: documents.pjLegalRepresentativeDocumentFront,
        legalRepresentativeDocumentBackPath: documents.pjLegalRepresentativeDocumentBack,
        legalRepresentativeSelfiePath: documents.pjSelfieDocument,
        pjBankProofPath: documents.pjBankProof,
        cnpjDocumentPath: documents.pjCnpjDocument,
        // Chaves da API (geradas automaticamente)
        publicKey: this.generatePublicKey(),
        secretKey: this.generateSecretKey(),
      },
    });
    return this.toDomain(created);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    if (!email) {
      return;
    }
    const normalizedEmail = email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    return user ? this.toDomain(user) : undefined;
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return this.toDomain(user);
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email?.trim());
    if (!user) {
      throw new NotFoundException('Credenciais inválidas');
    }

    const isPasswordValid = await this.verifyPassword(password ?? '', user.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Credenciais inválidas');
    }
    return user;
  }

  async ensureApiKeys(user: User): Promise<User> {
    // Se o usuário já tem chaves, retorna o usuário atual
    if (user.publicKey && user.secretKey) {
      return user;
    }

    // Se não tem chaves, gera e salva no banco
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        publicKey: this.generatePublicKey(),
        secretKey: this.generateSecretKey(),
      },
    });

    return this.toDomain(updatedUser);
  }

  async ensureApiKeysAndToken(user: User, accessToken: string): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        publicKey: user.publicKey || this.generatePublicKey(),
        secretKey: user.secretKey || this.generateSecretKey(),
        accessToken: accessToken,
      },
    });

    return this.toDomain(updatedUser);
  }

  async findByToken(token: string): Promise<User | undefined> {
    if (!token) {
      return;
    }
    const user = await this.prisma.user.findFirst({ 
      where: { accessToken: token } 
    });
    return user ? this.toDomain(user) : undefined;
  }

  private generatePublicKey(): string {
    const uuid = randomUUID().replace(/-/g, '');
    return `pk_${uuid.substring(0, 24)}`;
  }

  private generateSecretKey(): string {
    const uuid1 = randomUUID().replace(/-/g, '');
    const uuid2 = randomUUID().replace(/-/g, '');
    return `sk_${uuid1}${uuid2.substring(0, 16)}`;
  }

  private async hashPassword(password: string): Promise<string> {
    return hash(password, PASSWORD_SALT_ROUNDS);
  }

  private async verifyPassword(raw: string, stored: string): Promise<boolean> {
    if (!stored) {
      return false;
    }

    if (this.isBcryptHash(stored)) {
      return compare(raw, stored);
    }

    return stored === raw;
  }

  private isBcryptHash(value: string): boolean {
    return value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$');
  }

  async updateFees(userId: string, updateFeesDto: UpdateFeesDto): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fixedFee: updateFeesDto.fixedFee,
        percentageFee: updateFeesDto.percentageFee,
      },
    });

    return this.toDomain(updatedUser);
  }

  async getPendingSellers(page: number = 1, limit: number = 10): Promise<{
    sellers: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const result = await this.getUsers({ page, limit, status: 'pending' });
    return {
      sellers: result.users,
      pagination: result.pagination,
    };
  }

  async updateStatus(userId: string, status: string, options: { notes?: string } = {}): Promise<User> {
    const normalizedStatus = status?.toLowerCase();
    if (!VALID_STATUSES.includes(normalizedStatus as typeof VALID_STATUSES[number])) {
      throw new ConflictException('Status inválido. Use: pending, approved, rejected');
    }

    const notesValue = normalizedStatus === 'rejected'
      ? (options.notes?.trim() || null)
      : null;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status: normalizedStatus, notes: notesValue },
    });

    return this.toDomain(updatedUser);
  }

  private toDomain(model: PrismaUser): User {
    const wallet: WalletSnapshot = {
      balance: model.walletBalance,
      valorReceber: model.walletValorReceber,
      grossBalance: model.walletGrossBalance,
      currency: model.walletCurrency,
    };

    const address = model.addressCep ? {
      cep: model.addressCep,
      street: model.addressStreet,
      number: model.addressNumber,
      complement: model.addressComplement,
      neighborhood: model.addressNeighborhood,
      city: model.addressCity,
      state: model.addressState,
    } : undefined;

    const pfDocuments = model.pfDocumentFrontPath || model.pfDocumentBackPath || model.pfSelfieDocumentPath || model.pfBankProofPath ? {
      documentFront: model.pfDocumentFrontPath,
      documentBack: model.pfDocumentBackPath,
      selfieWithDocument: model.pfSelfieDocumentPath,
      bankProof: model.pfBankProofPath,
    } : undefined;

    const pjDocuments = model.legalRepresentativeDocumentFrontPath || model.legalRepresentativeDocumentBackPath || model.legalRepresentativeSelfiePath || model.pjBankProofPath || model.cnpjDocumentPath ? {
      legalRepresentativeDocumentFront: model.legalRepresentativeDocumentFrontPath,
      legalRepresentativeDocumentBack: model.legalRepresentativeDocumentBackPath,
      legalRepresentativeSelfie: model.legalRepresentativeSelfiePath,
      bankProof: model.pjBankProofPath,
      cnpjDocument: model.cnpjDocumentPath,
    } : undefined;

    const documents = model.documentName || model.documentCpf || pfDocuments || pjDocuments ? {
      name: model.documentName,
      cpf: model.documentCpf,
      pf: pfDocuments,
      pj: pjDocuments,
    } : undefined;

    return {
      id: model.id,
      name: model.name,
      email: model.email,
      phone: model.phone,
      password: model.password,
      status: model.status,
      operationType: model.operationType,
      averageTicket: model.averageTicket,
      cpf: model.cpf,
      cnpj: model.cnpj,
      corporateName: model.corporateName,
      salesPageLink: model.salesPageLink,
      address,
      documents,
      wallet,
      publicKey: model.publicKey,
      secretKey: model.secretKey,
      fixedFee: model.fixedFee,
      percentageFee: model.percentageFee,
      notes: model.notes ?? undefined,
    };
  }

  async getUsers(params: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.max(params.limit ?? 10, 1);
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (params.status) {
      const normalizedStatus = params.status.toLowerCase();
      if (!VALID_STATUSES.includes(normalizedStatus as typeof VALID_STATUSES[number])) {
        throw new ConflictException('Status inválido. Use: pending, approved, rejected');
      }
      where.status = normalizedStatus;
    }
    if (params.search) {
      const trimmedSearch = params.search.trim();
      if (trimmedSearch) {
        where.OR = [
          { name: { contains: trimmedSearch, mode: 'insensitive' } },
          { email: { contains: trimmedSearch, mode: 'insensitive' } },
          { cpf: { contains: trimmedSearch, mode: 'insensitive' } },
          { cnpj: { contains: trimmedSearch, mode: 'insensitive' } },
        ];
      }
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => this.toDomain(user)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
