export declare class TransactionItemDto {
    name: string;
    price: number;
    quantity?: number;
    description?: string;
}
export declare class CreateTransactionDto {
    publicKey: string;
    secretKey: string;
    amount: number;
    paymentMethod: 'pix' | 'card';
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
    cardNumber?: string;
    cardHolderName?: string;
    cardExpiryMonth?: string;
    cardExpiryYear?: string;
    cardCvv?: string;
    items?: TransactionItemDto[];
}
//# sourceMappingURL=create-transaction.dto.d.ts.map