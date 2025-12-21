import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { WalletMovementService } from './wallet-movement.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ApiKeysService } from '../api-keys/api-keys.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly usersService: UsersService,
    private readonly walletMovementService: WalletMovementService,
    private readonly prisma: PrismaService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  async getWalletSummary(userId: string) {
    const user = await this.usersService.findById(userId);
    const averageTicket = await this.calculateAverageTicket(userId);

    return {
      userId: user.id,
      currency: user.wallet.currency,
      saldoAtual: user.wallet.balance,
      grossBalance: user.wallet.grossBalance,
      valorReceber: user.wallet.valorReceber,
      averageTicketSold: averageTicket,
      refundFee: 0,
    };
  }

  async getStatement(userId: string, options?: {
    from?: string;
    to?: string;
    limit?: number;
    category?: string;
  }) {
    const statementOptions = {
      from: options?.from ? new Date(options.from) : undefined,
      to: options?.to ? new Date(options.to) : undefined,
      limit: options?.limit,
      category: options?.category,
    };

    return this.walletMovementService.getStatement(userId, statementOptions);
  }

  async getBalance(userId: string, options?: { from?: string; to?: string }) {
    const user = await this.usersService.findById(userId);
    const averageTicket = await this.calculateAverageTicket(userId);

    let fromDate = this.parseDate(options?.from, 'from');
    let toDate = this.parseDate(options?.to, 'to');

    // Se nenhuma data foi fornecida, usar última semana como padrão
    if (!fromDate && !toDate) {
      const now = new Date();
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 7); // 7 dias atrás
      fromDate.setHours(0, 0, 0, 0); // Início do dia
      
      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999); // Final do dia
    }

    if (fromDate && toDate && fromDate > toDate) {
      throw new BadRequestException('Data inicial não pode ser maior que a data final');
    }

    const createdAtFilter =
      fromDate || toDate
        ? {
            ...(fromDate && { gte: fromDate }),
            ...(toDate && { lte: toDate }),
          }
        : undefined;

    const [creditsAggregate, debitsAggregate, salesCount] = await Promise.all([
      this.prisma.walletMovement.aggregate({
        where: {
          userId,
          type: 'credit',
          ...(createdAtFilter && { createdAt: createdAtFilter }),
        },
        _sum: { amount: true },
      }),
      this.prisma.walletMovement.aggregate({
        where: {
          userId,
          type: 'debit',
          ...(createdAtFilter && { createdAt: createdAtFilter }),
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({
        where: {
          receiverUserId: userId,
          status: 'approved',
          ...(createdAtFilter && { createdAt: createdAtFilter }),
        },
      }),
    ]);

    const periodCredits = creditsAggregate._sum.amount || 0;
    const periodDebits = debitsAggregate._sum.amount || 0;
    const netMovement = periodCredits - periodDebits;
    
    return {
      userId: user.id,
      balance: user.wallet.balance,
      grossBalance: user.wallet.grossBalance,
      currency: user.wallet.currency,
      averageTicketSold: averageTicket,
      refundFee: 0,
      period: {
        from: fromDate,
        to: toDate,
        totalCredits: periodCredits,
        totalDebits: periodDebits,
        netMovement,
        salesCount,
      },
    };
  }

  private async calculateAverageTicket(userId: string): Promise<number> {
    const aggregates = await this.prisma.transaction.aggregate({
      where: {
        receiverUserId: userId,
        status: 'approved',
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalAmount = aggregates._sum.amount || 0;
    const totalCount = aggregates._count.id || 0;
    return totalCount > 0 ? totalAmount / totalCount : 0;
  }

  async createWithdrawal(dto: CreateWithdrawalDto) {
    // Validar API keys via service (já feito pelo guard, mas vamos pegar os dados do usuário)
    const { userId } = await this.apiKeysService.validateApiCredentials(dto.publicKey, dto.secretKey);
    
    // Verificar saldo suficiente
    const user = await this.usersService.findById(userId);
    if (user.wallet.balance < dto.amount) {
      throw new BadRequestException('Saldo insuficiente para realizar o saque');
    }

    // Validar dados específicos do método
    if (dto.method === 'pix') {
      if (!dto.pixKey || !dto.pixKeyType) {
        throw new BadRequestException('Dados PIX são obrigatórios para saque via PIX');
      }
    } else if (dto.method === 'bank_transfer') {
      if (!dto.bankCode || !dto.accountNumber || !dto.agency || !dto.accountHolderName) {
        throw new BadRequestException('Dados bancários são obrigatórios para transferência bancária');
      }
    }

    // Criar o saque
    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        userId,
        amount: dto.amount,
        method: dto.method,
        status: 'pending',
        description: dto.description,
        bankCode: dto.bankCode,
        accountNumber: dto.accountNumber,
        accountDigit: dto.accountDigit,
        agency: dto.agency,
        agencyDigit: dto.agencyDigit,
        accountHolderName: dto.accountHolderName,
        accountHolderDocument: dto.accountHolderDocument,
        pixKey: dto.pixKey,
        pixKeyType: dto.pixKeyType,
      },
    });

    // Debitar da carteira
    await this.walletMovementService.createMovement({
      userId,
      type: 'debit',
      category: 'withdrawal',
      amount: dto.amount,
      description: dto.description || `Saque via ${dto.method}`,
      referenceType: 'withdrawal',
      referenceId: withdrawal.id,
      metadata: {
        withdrawalId: withdrawal.id,
        method: dto.method,
      },
    });

    return {
      id: withdrawal.id,
      amount: withdrawal.amount,
      method: withdrawal.method,
      status: withdrawal.status,
      description: withdrawal.description,
      createdAt: withdrawal.createdAt,
    };
  }

  private parseDate(value?: string, label?: string): Date | undefined {
    if (!value) {
      return undefined;
    }
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      throw new BadRequestException(`Data inválida para o parâmetro ${label || 'date'}`);
    }
    
    // Se for um parâmetro 'to' e for apenas uma data (sem horário), setar para final do dia
    if (label === 'to' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      parsed.setUTCHours(23, 59, 59, 999);
    }
    
    return parsed;
  }
}
