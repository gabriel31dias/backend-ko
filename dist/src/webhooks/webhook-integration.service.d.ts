import { WebhooksService } from './webhooks.service';
export declare class WebhookIntegrationService {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    onPaymentCreated(transaction: any): Promise<void>;
    onPaymentCompleted(transaction: any): Promise<void>;
    onWithdrawCompleted(withdrawal: any): Promise<void>;
    onRefund(refund: any): Promise<void>;
}
//# sourceMappingURL=webhook-integration.service.d.ts.map