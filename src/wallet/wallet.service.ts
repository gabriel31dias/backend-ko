import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { WalletMovementService } from './wallet-movement.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly usersService: UsersService,
    private readonly walletMovementService: WalletMovementService,
    private readonly prisma: PrismaService,
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

    const fromDate = this.parseDate(options?.from, 'from');
    const toDate = this.parseDate(options?.to, 'to');

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

    const [creditsAggregate, debitsAggregate] = await Promise.all([
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

  private parseDate(value?: string, label?: string): Date | undefined {
    if (!value) {
      return undefined;
    }
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      throw new BadRequestException(`Data inválida para o parâmetro ${label || 'date'}`);
    }
    return parsed;
  }
}
