import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletMovement, WalletStatement } from './entities/wallet-movement.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class WalletMovementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  async createMovement(data: {
    userId: string;
    type: 'credit' | 'debit';
    category: 'transaction_credit' | 'transaction_fee' | 'withdrawal' | 'refund' | 'adjustment';
    amount: number;
    description?: string;
    referenceType?: 'transaction' | 'withdrawal' | 'manual';
    referenceId?: string;
    metadata?: any;
  }): Promise<WalletMovement> {
    // Buscar saldo atual do usuário
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
      select: { walletBalance: true },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const balanceBefore = user.walletBalance;
    const balanceAfter = data.type === 'credit' 
      ? balanceBefore + data.amount 
      : balanceBefore - data.amount;

    // Criar movimentação
    const movement = await this.prisma.walletMovement.create({
      data: {
        userId: data.userId,
        type: data.type,
        category: data.category,
        amount: data.amount,
        balanceBefore,
        balanceAfter,
        description: data.description,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        metadata: data.metadata,
      },
    });

    return this.toDomain(movement);
  }

  async createTransactionMovements(
    userId: string,
    transactionId: string,
    grossAmount: number,
    netAmount: number,
    fees: {
      fixedFeeAmount: number;
      percentageFeeAmount: number;
      totalFees: number;
    }
  ): Promise<WalletMovement[]> {
    const movements: WalletMovement[] = [];

    // 1. Crédito do valor líquido
    const creditMovement = await this.createMovement({
      userId,
      type: 'credit',
      category: 'transaction_credit',
      amount: netAmount,
      description: `Recebimento de transação - Valor líquido`,
      referenceType: 'transaction',
      referenceId: transactionId,
      metadata: {
        grossAmount,
        netAmount,
        fees,
      },
    });
    movements.push(creditMovement);

    // 2. Débito das taxas (se houver)
    if (fees.totalFees > 0) {
      const feeMovement = await this.createMovement({
        userId,
        type: 'debit',
        category: 'transaction_fee',
        amount: fees.totalFees,
        description: `Taxa de transação (Fixa: R$ ${fees.fixedFeeAmount.toFixed(2)} + Percentual: R$ ${fees.percentageFeeAmount.toFixed(2)})`,
        referenceType: 'transaction',
        referenceId: transactionId,
        metadata: {
          fixedFee: fees.fixedFeeAmount,
          percentageFee: fees.percentageFeeAmount,
          totalFees: fees.totalFees,
        },
      });
      movements.push(feeMovement);
    }

    return movements;
  }

  async getStatement(
    userId: string,
    options?: {
      from?: Date;
      to?: Date;
      limit?: number;
      category?: string;
    }
  ): Promise<WalletStatement> {
    const from = options?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás
    const to = options?.to || new Date();

    // Buscar movimentações
    const movements = await this.prisma.walletMovement.findMany({
      where: {
        userId,
        createdAt: {
          gte: from,
          lte: to,
        },
        ...(options?.category && { category: options.category }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 100,
    });

    // Buscar taxas efetivas do usuário
    const effectiveFees = await this.settingsService.getUserEffectiveFees(userId);

    // Calcular resumo
    const totalCredits = movements
      .filter(m => m.type === 'credit')
      .reduce((sum, m) => sum + m.amount, 0);

    const totalDebits = movements
      .filter(m => m.type === 'debit')
      .reduce((sum, m) => sum + m.amount, 0);

    const netMovement = totalCredits - totalDebits;

    // Buscar saldo atual
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    // Processar movimentações e adicionar descrições com taxas
    const enhancedMovements = movements.map(m => {
      const domainMovement = this.toDomain(m);
      
      // Se for uma taxa de transação e não tem descrição de taxa, adicionar
      if (domainMovement.category === 'transaction_fee' && (!domainMovement.description || !domainMovement.description.includes('Taxa de transação'))) {
        const fixedFeeAmount = effectiveFees.fixedFee;
        const percentageFeeAmount = domainMovement.metadata?.percentageFee || 
          (domainMovement.metadata?.grossAmount ? (domainMovement.metadata.grossAmount * effectiveFees.percentageFee) / 100 : 0);
        
        domainMovement.description = `Taxa de transação (Fixa: R$ ${fixedFeeAmount.toFixed(2)} + Percentual: R$ ${percentageFeeAmount.toFixed(2)})`;
      }
      
      return domainMovement;
    });

    return {
      movements: enhancedMovements,
      summary: {
        totalCredits,
        totalDebits,
        netMovement,
        currentBalance: user?.walletBalance || 0,
      },
      period: { from, to },
    };
  }

  async getMovementsByTransaction(transactionId: string): Promise<WalletMovement[]> {
    const movements = await this.prisma.walletMovement.findMany({
      where: { referenceId: transactionId },
      orderBy: { createdAt: 'asc' },
    });

    return movements.map(m => this.toDomain(m));
  }

  private toDomain(movement: any): WalletMovement {
    return {
      id: movement.id,
      userId: movement.userId,
      type: movement.type as 'credit' | 'debit',
      category: movement.category as any,
      amount: movement.amount,
      balanceBefore: movement.balanceBefore,
      balanceAfter: movement.balanceAfter,
      description: movement.description,
      referenceType: movement.referenceType as any,
      referenceId: movement.referenceId,
      metadata: movement.metadata,
      createdAt: movement.createdAt,
    };
  }
}
