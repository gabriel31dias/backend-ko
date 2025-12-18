import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    create(req: any, createWebhookDto: CreateWebhookDto): Promise<import("./entities/webhook.entity").Webhook>;
    findAll(req: any): Promise<import("./entities/webhook.entity").Webhook[]>;
    findOne(req: any, id: string): Promise<import("./entities/webhook.entity").Webhook>;
    update(req: any, id: string, updateWebhookDto: UpdateWebhookDto): Promise<import("./entities/webhook.entity").Webhook>;
    delete(req: any, id: string): Promise<void>;
    getDeliveries(req: any, id: string, limit?: string, eventType?: string): Promise<import("./entities/webhook.entity").WebhookDelivery[]>;
    testWebhook(req: any, id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=webhooks.controller.d.ts.map