export interface TransactionItem {
    name: string;
    price: number;
    quantity?: number;
    description?: string;
}
export interface Transaction {
    id: string;
    amount: number;
    paymentMethod: 'pix' | 'card';
    status: 'pending' | 'waiting' | 'approved' | 'rejected';
    transactionId: string;
    description?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerDocument?: string;
    customerType: 'pf' | 'pj';
    customerTaxId: string;
    customerStreet: string;
    customerNumber: string;
    customerComplement?: string;
    customerNeighborhood: string;
    customerCity: string;
    customerState: string;
    customerZipCode: string;
    receiverUserId: string;
    createdAt: Date;
    approvedAt?: Date;
    pixCode?: string;
    pixQrCode?: string;
    pixExpiresAt?: Date;
    authorizationCode?: string;
    nsu?: string;
    grossAmount?: number;
    fixedFeeApplied?: number;
    percentageFeeApplied?: number;
    totalFeesApplied?: number;
    netAmount?: number;
    items?: TransactionItem[];
}
export interface TransactionResponse {
    success: boolean;
    transaction: Transaction;
    pixCode?: string;
    pixQrCode?: string;
    pixExpiresAt?: Date;
    message?: string;
    error?: string;
}
//# sourceMappingURL=transaction.entity.d.ts.map