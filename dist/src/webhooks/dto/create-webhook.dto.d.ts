export declare class CreateWebhookDto {
    url: string;
    description?: string;
    eventPaymentCreated: boolean;
    eventPaymentCompleted: boolean;
    eventWithdrawCompleted: boolean;
    eventRefund: boolean;
    secretKey?: string;
    maxRetries?: number;
    timeoutSeconds?: number;
}
//# sourceMappingURL=create-webhook.dto.d.ts.map