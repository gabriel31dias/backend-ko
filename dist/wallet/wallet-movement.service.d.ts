import { PrismaService } from '../prisma/prisma.service';
import { WalletMovement, WalletStatement } from './entities/wallet-movement.entity';
export declare class WalletMovementService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createMovement(data: {
        userId: string;
        type: 'credit' | 'debit';
        category: 'transaction_credit' | 'transaction_fee' | 'withdrawal' | 'refund' | 'adjustment';
        amount: number;
        description?: string;
        referenceType?: 'transaction' | 'withdrawal' | 'manual';
        referenceId?: string;
        metadata?: any;
    }): Promise<WalletMovement>;
    createTransactionMovements(userId: string, transactionId: string, grossAmount: number, netAmount: number, fees: {
        fixedFeeAmount: number;
        percentageFeeAmount: number;
        totalFees: number;
    }): Promise<WalletMovement[]>;
    getStatement(userId: string, options?: {
        from?: Date;
        to?: Date;
        limit?: number;
        category?: string;
    }): Promise<WalletStatement>;
    getMovementsByTransaction(transactionId: string): Promise<WalletMovement[]>;
    private toDomain;
}
//# sourceMappingURL=wallet-movement.service.d.ts.map