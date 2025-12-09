import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateFeesDto } from './dto/update-fees.dto';
import { User, WalletSnapshot } from './user.entity';
import { randomUUID } from 'crypto';

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

    const created = await this.prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email.toLowerCase(),
        phone: payload.phone,
        password: payload.password,
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
    const user = await this.findByEmail(email);
    if (!user || user.password !== password) {
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
    };
  }
}
