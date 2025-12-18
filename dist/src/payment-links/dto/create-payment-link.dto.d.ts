export declare class CreatePaymentLinkDto {
    title: string;
    description?: string;
    amount: number;
    currency: 'BRL' | 'USD' | 'EUR';
    expiresIn?: string;
    maxUses?: number;
    requireEmail: boolean;
    requirePhone: boolean;
    allowCustomAmount: boolean;
    brandColor?: string;
    accentColor?: string;
    backgroundImage?: string;
}
//# sourceMappingURL=create-payment-link.dto.d.ts.map