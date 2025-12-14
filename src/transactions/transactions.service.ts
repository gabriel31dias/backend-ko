import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { WalletMovementService } from '../wallet/wallet-movement.service';
import { SettingsService } from '../settings/settings.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { Transaction, TransactionResponse } from './entities/transaction.entity';
import { randomUUID } from 'crypto';

interface FeesResult {
  grossAmount: number;
  fixedFeeAmount: number;
  percentageFeeAmount: number;
  totalFees: number;
  netAmount: number;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly walletMovementService: WalletMovementService,
    private readonly settingsService: SettingsService,
  ) {}

  async processTransaction(dto: CreateTransactionDto): Promise<TransactionResponse> {
    // 1. Validar credenciais e encontrar usuário
    const user = await this.validateApiCredentials(dto.publicKey, dto.secretKey);
    
    // 2. Processar via adquirente (mock)
    const adquirenteResponse = await this.mockAdquirenteProcess(dto);
    
    // 3. Criar transação no banco
    const transaction = await this.createTransaction(dto, user.id, adquirenteResponse);
    
    // 4. PIX não atualiza carteira imediatamente (só via webhook)
    // Cartão atualiza imediatamente se aprovado
    let feeSummary: FeesResult | undefined;
    if (dto.paymentMethod === 'card' && adquirenteResponse.status === 'approved') {
      feeSummary = await this.updateUserWallet(user.id, dto.amount, adquirenteResponse.transactionId);

      if (feeSummary) {
        transaction.grossAmount = feeSummary.grossAmount;
        transaction.fixedFeeApplied = feeSummary.fixedFeeAmount;
        transaction.percentageFeeApplied = feeSummary.percentageFeeAmount;
        transaction.totalFeesApplied = feeSummary.totalFees;
        transaction.netAmount = feeSummary.netAmount;
      }
    }
    
    return {
      success: adquirenteResponse.status === 'approved' || adquirenteResponse.status === 'waiting',
      transaction,
      pixCode: adquirenteResponse.pixCode,
      pixQrCode: adquirenteResponse.pixQrCode,
      pixExpiresAt: adquirenteResponse.pixExpiresAt,
      message: adquirenteResponse.message,
      error: adquirenteResponse.error,
    };
  }

  private async validateApiCredentials(publicKey: string, secretKey: string) {
    // Procurar usuário com essas credenciais
    const user = await this.prisma.user.findFirst({
      where: {
        publicKey,
        secretKey,
      },
    });

    if (!user) {
      throw new BadRequestException('Credenciais de API inválidas');
    }

    return user;
  }

  private async mockAdquirenteProcess(dto: CreateTransactionDto): Promise<MockAdquirenteResponse> {
    // Mock de resposta das adquirentes
    const transactionId = `TXN_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    
    if (dto.paymentMethod === 'pix') {
      return this.mockPixResponse(dto, transactionId);
    } else {
      return this.mockCardResponse(dto, transactionId);
    }
  }

  private async mockPixResponse(dto: CreateTransactionDto, transactionId: string): Promise<MockAdquirenteResponse> {
    // Simular processamento PIX
    await new Promise(resolve => setTimeout(resolve, 100)); // Simula delay da API
    
    // PIX sempre retorna "waiting" - só confirma por webhook
    const pixCode = this.generateMockPixCode();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
    
    return {
      status: 'waiting',
      transactionId,
      pixCode,
      pixQrCode: `https://mock-qrcode.com/${pixCode}`,
      pixExpiresAt: expiresAt,
      message: 'PIX gerado com sucesso. Aguardando pagamento.',
      authorizationCode: `PIX_${randomUUID().substring(0, 8)}`,
    };
  }

  private async mockCardResponse(dto: CreateTransactionDto, transactionId: string): Promise<MockAdquirenteResponse> {
    // Simular processamento cartão
    await new Promise(resolve => setTimeout(resolve, 200)); // Simula delay da API
    
    // Validações básicas do cartão
    if (!dto.cardNumber || !dto.cardHolderName || !dto.cardCvv) {
      return {
        status: 'rejected',
        transactionId,
        error: 'Dados do cartão incompletos',
        message: 'Número, nome do portador e CVV são obrigatórios',
      };
    }

    // 80% de chance de aprovação
    const isApproved = Math.random() > 0.2;
    
    if (isApproved) {
      return {
        status: 'approved',
        transactionId,
        authorizationCode: `AUTH_${randomUUID().substring(0, 10)}`,
        nsu: `NSU_${Math.floor(Math.random() * 1000000)}`,
        message: 'Transação aprovada',
      };
    } else {
      const errors = [
        'Cartão sem limite',
        'Cartão bloqueado',
        'Dados inválidos',
        'Emissor indisponível',
      ];
      
      return {
        status: 'rejected',
        transactionId,
        error: errors[Math.floor(Math.random() * errors.length)],
        message: 'Transação negada pelo emissor',
      };
    }
  }

  private generateMockPixCode(): string {
    // Gerar código PIX mock (formato simplificado)
    return `00020126330014BR.GOV.BCB.PIX${randomUUID().substring(0, 8)}`;
  }

  private async createTransaction(
    dto: CreateTransactionDto, 
    userId: string, 
    adquirenteResponse: MockAdquirenteResponse
  ): Promise<Transaction> {
    // Calcular data de vencimento (2 dias após criação)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2);

    const transaction = await this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        status: adquirenteResponse.status,
        transactionId: adquirenteResponse.transactionId,
        description: dto.description,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        customerDocument: dto.customerDocument,
        customerType: dto.customerType,
        customerTaxId: dto.customerTaxId,
        // Endereço do cliente
        customerStreet: dto.customerStreet,
        customerNumber: dto.customerNumber,
        customerComplement: dto.customerComplement,
        customerNeighborhood: dto.customerNeighborhood,
        customerCity: dto.customerCity,
        customerState: dto.customerState,
        customerZipCode: dto.customerZipCode,
        receiverUserId: userId,
        // PIX específico
        pixCode: adquirenteResponse.pixCode,
        pixQrCode: adquirenteResponse.pixQrCode,
        pixExpiresAt: adquirenteResponse.pixExpiresAt,
        // Cartão específico
        authorizationCode: adquirenteResponse.authorizationCode,
        nsu: adquirenteResponse.nsu,
        // Items da transação
        items: dto.items ? JSON.stringify(dto.items) : null,
        approvedAt: adquirenteResponse.status === 'approved' ? new Date() : null,
      },
    });

    return {
      id: transaction.id,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod as 'pix' | 'card',
      status: transaction.status as 'pending' | 'waiting' | 'approved' | 'rejected',
      transactionId: transaction.transactionId,
      description: transaction.description,
      customerName: transaction.customerName,
      customerEmail: transaction.customerEmail,
      customerPhone: transaction.customerPhone,
      customerDocument: transaction.customerDocument,
      customerType: transaction.customerType as 'pf' | 'pj',
      customerTaxId: transaction.customerTaxId,
      customerStreet: transaction.customerStreet,
      customerNumber: transaction.customerNumber,
      customerComplement: transaction.customerComplement,
      customerNeighborhood: transaction.customerNeighborhood,
      customerCity: transaction.customerCity,
      customerState: transaction.customerState,
      customerZipCode: transaction.customerZipCode,
      receiverUserId: transaction.receiverUserId,
      createdAt: transaction.createdAt,
      approvedAt: transaction.approvedAt,
      expiresAt: transaction.pixExpiresAt,
      pixCode: transaction.pixCode,
      pixQrCode: transaction.pixQrCode,
      pixExpiresAt: transaction.pixExpiresAt,
      authorizationCode: transaction.authorizationCode,
      nsu: transaction.nsu,
      grossAmount: transaction.grossAmount,
      fixedFeeApplied: transaction.fixedFeeApplied,
      percentageFeeApplied: transaction.percentageFeeApplied,
      totalFeesApplied: transaction.totalFeesApplied,
      netAmount: transaction.netAmount,
      items: transaction.items ? JSON.parse(transaction.items as string) : null,
    };
  }

  private async updateUserWallet(userId: string, grossAmount: number, transactionId?: string): Promise<FeesResult | undefined> {
    // Buscar taxas efetivas do usuário (prioriza específicas sobre globais)
    const effectiveFees = await this.settingsService.getUserEffectiveFees(userId);

    // Calcular taxas
    const fees = this.calculateFees(grossAmount, effectiveFees.fixedFee, effectiveFees.percentageFee);

    // Salvar informações de taxas na transação (se fornecido transactionId)
    if (transactionId) {
      await this.prisma.transaction.update({
        where: { transactionId },
        data: {
          grossAmount: fees.grossAmount,
          fixedFeeApplied: fees.fixedFeeAmount,
          percentageFeeApplied: fees.percentageFeeAmount,
          totalFeesApplied: fees.totalFees,
          netAmount: fees.netAmount,
        },
      });

      // Criar movimentações na carteira (crédito + desconto de taxas)
      await this.walletMovementService.createTransactionMovements(
        userId,
        transactionId,
        grossAmount,
        fees.netAmount,
        {
          fixedFeeAmount: fees.fixedFeeAmount,
          percentageFeeAmount: fees.percentageFeeAmount,
          totalFees: fees.totalFees,
        }
      );
    }

    // Creditar valor líquido na carteira
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          increment: fees.netAmount,
        },
        walletGrossBalance: {
          increment: grossAmount,
        },
      },
    });

    return fees;
  }

  private calculateFees(grossAmount: number, fixedFee: number, percentageFee: number) {
    const fixedFeeAmount = fixedFee || 0;
    const percentageFeeAmount = (grossAmount * (percentageFee || 0)) / 100;
    const totalFees = fixedFeeAmount + percentageFeeAmount;
    const netAmount = Math.max(0, grossAmount - totalFees); // Não pode ser negativo

    return {
      grossAmount,
      fixedFeeAmount,
      percentageFeeAmount,
      totalFees,
      netAmount,
    };
  }

  async processWebhook(webhookData: any): Promise<{ success: boolean; message: string }> {
    try {
      // Encontrar transação pelo transactionId
      const transaction = await this.prisma.transaction.findFirst({
        where: { transactionId: webhookData.transactionId },
        include: { receiver: true },
      });

      if (!transaction) {
        return { success: false, message: 'Transação não encontrada' };
      }

      if (transaction.status !== 'waiting') {
        return { success: false, message: 'Transação já processada' };
      }

      // Validar valor (segurança)
      if (Math.abs(transaction.amount - webhookData.amount) > 0.01) {
        return { success: false, message: 'Valor divergente' };
      }

      // Atualizar transação
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: webhookData.status,
          approvedAt: webhookData.status === 'approved' ? new Date() : null,
        },
      });

      // Se aprovada, atualizar carteira de forma segura com taxas
      if (webhookData.status === 'approved') {
        await this.updateUserWallet(transaction.receiverUserId, transaction.amount, transaction.transactionId);
      }

      return {
        success: true,
        message: `Transação ${webhookData.status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`,
      };
    } catch (error) {
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  async getTransactionsPaginated(userId: string, query: PaginationQueryDto): Promise<PaginatedTransactions> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = { 
      receiverUserId: userId 
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    if (query.customerName) {
      where.customerName = {
        contains: query.customerName,
        mode: 'insensitive', // Case insensitive
      };
    }

    if (query.search) {
      where.OR = [
        {
          customerName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          customerEmail: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          customerTaxId: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          customerDocument: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        // Se não tem horário, adiciona 00:00:00
        const startDate = query.startDate.includes('T') ? 
          new Date(query.startDate) : 
          new Date(query.startDate + 'T00:00:00');
        where.createdAt.gte = startDate;
      }
      if (query.endDate) {
        // Se não tem horário, adiciona 23:59:59
        const endDate = query.endDate.includes('T') ? 
          new Date(query.endDate) : 
          new Date(query.endDate + 'T23:59:59');
        where.createdAt.lte = endDate;
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        paymentMethod: t.paymentMethod as 'pix' | 'card',
        status: t.status as 'pending' | 'waiting' | 'approved' | 'rejected',
        transactionId: t.transactionId,
        description: t.description,
        customerName: t.customerName,
        customerEmail: t.customerEmail,
        customerPhone: t.customerPhone,
        customerDocument: t.customerDocument,
        customerType: t.customerType as 'pf' | 'pj',
        customerTaxId: t.customerTaxId,
        customerStreet: t.customerStreet,
        customerNumber: t.customerNumber,
        customerComplement: t.customerComplement,
        customerNeighborhood: t.customerNeighborhood,
        customerCity: t.customerCity,
        customerState: t.customerState,
        customerZipCode: t.customerZipCode,
        receiverUserId: t.receiverUserId,
        createdAt: t.createdAt,
        approvedAt: t.approvedAt,
        expiresAt: t.pixExpiresAt,
        pixCode: t.pixCode,
        pixQrCode: t.pixQrCode,
        pixExpiresAt: t.pixExpiresAt,
        authorizationCode: t.authorizationCode,
        nsu: t.nsu,
        grossAmount: t.grossAmount,
        fixedFeeApplied: t.fixedFeeApplied,
        percentageFeeApplied: t.percentageFeeApplied,
        totalFeesApplied: t.totalFeesApplied,
        netAmount: t.netAmount,
        items: t.items as any,
      })),
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

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { receiverUserId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map(t => ({
      id: t.id,
      amount: t.amount,
      paymentMethod: t.paymentMethod as 'pix' | 'card',
      status: t.status as 'pending' | 'waiting' | 'approved' | 'rejected',
      transactionId: t.transactionId,
      description: t.description,
      customerName: t.customerName,
      customerEmail: t.customerEmail,
      customerPhone: t.customerPhone,
      customerDocument: t.customerDocument,
      customerType: t.customerType as 'pf' | 'pj',
      customerTaxId: t.customerTaxId,
      customerStreet: t.customerStreet,
      customerNumber: t.customerNumber,
      customerComplement: t.customerComplement,
      customerNeighborhood: t.customerNeighborhood,
      customerCity: t.customerCity,
      customerState: t.customerState,
      customerZipCode: t.customerZipCode,
      receiverUserId: t.receiverUserId,
      createdAt: t.createdAt,
      approvedAt: t.approvedAt,
      expiresAt: t.pixExpiresAt,
      pixCode: t.pixCode,
      pixQrCode: t.pixQrCode,
      pixExpiresAt: t.pixExpiresAt,
      authorizationCode: t.authorizationCode,
      nsu: t.nsu,
      grossAmount: t.grossAmount,
      fixedFeeApplied: t.fixedFeeApplied,
      percentageFeeApplied: t.percentageFeeApplied,
      totalFeesApplied: t.totalFeesApplied,
      netAmount: t.netAmount,
      items: t.items ? JSON.parse(t.items as string) : null,
    }));
  }
}

interface MockAdquirenteResponse {
  status: 'pending' | 'waiting' | 'approved' | 'rejected';
  transactionId: string;
  message?: string;
  error?: string;
  // PIX específico
  pixCode?: string;
  pixQrCode?: string;
  pixExpiresAt?: Date;
  // Cartão específico
  authorizationCode?: string;
  nsu?: string;
}
