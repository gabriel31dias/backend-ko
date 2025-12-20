export declare class CreateWithdrawalDto {
    publicKey: string;
    secretKey: string;
    amount: number;
    method: 'pix' | 'bank_transfer';
    description?: string;
    bankCode?: string;
    accountNumber?: string;
    accountDigit?: string;
    agency?: string;
    agencyDigit?: string;
    accountHolderName?: string;
    accountHolderDocument?: string;
    pixKey?: string;
    pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
}
//# sourceMappingURL=create-withdrawal.dto.d.ts.map