import { PrismaService } from '../prisma/prisma.service';
import { Webhook, WebhookDelivery, WebhookEvent } from './entities/webhook.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
export declare class WebhooksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateWebhookDto): Promise<Webhook>;
    findAll(userId: string): Promise<Webhook[]>;
    findOne(id: string, userId: string): Promise<Webhook>;
    update(id: string, userId: string, dto: UpdateWebhookDto): Promise<Webhook>;
    delete(id: string, userId: string): Promise<void>;
    getDeliveries(webhookId: string, userId: string, options?: {
        limit?: number;
        eventType?: string;
    }): Promise<WebhookDelivery[]>;
    triggerWebhook(event: WebhookEvent): Promise<void>;
    private sendWebhook;
    private scheduleRetry;
    private generateSecretKey;
    private createSignature;
    private toDomain;
    private toDeliveryDomain;
}
//# sourceMappingURL=webhooks.service.d.ts.map