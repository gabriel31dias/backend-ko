export interface WalletMovement {
    id: string;
    userId: string;
    type: 'credit' | 'debit';
    category: 'transaction_credit' | 'transaction_fee' | 'withdrawal' | 'refund' | 'adjustment';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description?: string;
    referenceType?: 'transaction' | 'withdrawal' | 'manual';
    referenceId?: string;
    metadata?: any;
    createdAt: Date;
}
export interface WalletStatement {
    movements: WalletMovement[];
    summary: {
        totalCredits: number;
        totalDebits: number;
        netMovement: number;
        currentBalance: number;
    };
    period: {
        from: Date;
        to: Date;
    };
}
//# sourceMappingURL=wallet-movement.entity.d.ts.map