"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
let WebhooksService = class WebhooksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const secretKey = dto.secretKey || this.generateSecretKey();
        const webhook = await this.prisma.webhook.create({
            data: {
                userId,
                url: dto.url,
                description: dto.description,
                eventPaymentCreated: dto.eventPaymentCreated,
                eventPaymentCompleted: dto.eventPaymentCompleted,
                eventWithdrawCompleted: dto.eventWithdrawCompleted,
                eventRefund: dto.eventRefund,
                secretKey,
                maxRetries: dto.maxRetries || 3,
                timeoutSeconds: dto.timeoutSeconds || 30,
            },
        });
        return this.toDomain(webhook);
    }
    async findAll(userId) {
        const webhooks = await this.prisma.webhook.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return webhooks.map(this.toDomain);
    }
    async findOne(id, userId) {
        const webhook = await this.prisma.webhook.findFirst({
            where: { id, userId },
        });
        if (!webhook) {
            throw new common_1.NotFoundException('Webhook não encontrado');
        }
        return this.toDomain(webhook);
    }
    async update(id, userId, dto) {
        const webhook = await this.prisma.webhook.findFirst({
            where: { id, userId },
        });
        if (!webhook) {
            throw new common_1.NotFoundException('Webhook não encontrado');
        }
        const updated = await this.prisma.webhook.update({
            where: { id },
            data: Object.assign(Object.assign({}, dto), { updatedAt: new Date() }),
        });
        return this.toDomain(updated);
    }
    async delete(id, userId) {
        const webhook = await this.prisma.webhook.findFirst({
            where: { id, userId },
        });
        if (!webhook) {
            throw new common_1.NotFoundException('Webhook não encontrado');
        }
        await this.prisma.webhook.delete({
            where: { id },
        });
    }
    async getDeliveries(webhookId, userId, options) {
        const webhook = await this.findOne(webhookId, userId);
        const deliveries = await this.prisma.webhookDelivery.findMany({
            where: Object.assign({ webhookId }, ((options === null || options === void 0 ? void 0 : options.eventType) && { eventType: options.eventType })),
            orderBy: { createdAt: 'desc' },
            take: (options === null || options === void 0 ? void 0 : options.limit) || 50,
        });
        return deliveries.map(this.toDeliveryDomain);
    }
    async triggerWebhook(event) {
        const eventFieldMap = {
            'payment_created': 'eventPaymentCreated',
            'payment_completed': 'eventPaymentCompleted',
            'withdraw_completed': 'eventWithdrawCompleted',
            'refund': 'eventRefund',
        };
        const eventField = eventFieldMap[event.eventType];
        if (!eventField)
            return;
        const webhooks = await this.prisma.webhook.findMany({
            where: {
                userId: event.userId,
                isActive: true,
                [eventField]: true,
            },
        });
        for (const webhook of webhooks) {
            await this.sendWebhook(webhook, event);
        }
    }
    async sendWebhook(webhook, event) {
        const payload = {
            event: event.eventType,
            data: event.data,
            timestamp: event.timestamp,
            webhook_id: webhook.id,
        };
        let signature;
        if (webhook.secretKey) {
            signature = this.createSignature(payload, webhook.secretKey);
        }
        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: Object.assign(Object.assign({ 'Content-Type': 'application/json' }, (signature && { 'X-Webhook-Signature': signature })), { 'User-Agent': 'Spinmaaser-Webhooks/1.0' }),
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(webhook.timeoutSeconds * 1000),
            });
            await this.prisma.webhookDelivery.create({
                data: {
                    webhookId: webhook.id,
                    eventType: event.eventType,
                    payload,
                    responseCode: response.status,
                    responseBody: await response.text().catch(() => ''),
                    success: response.ok,
                    attempts: 1,
                    lastAttempt: new Date(),
                },
            });
            if (!response.ok && webhook.maxRetries > 1) {
                await this.scheduleRetry(webhook.id, event, 1);
            }
        }
        catch (error) {
            await this.prisma.webhookDelivery.create({
                data: {
                    webhookId: webhook.id,
                    eventType: event.eventType,
                    payload,
                    responseCode: null,
                    responseBody: error.message,
                    success: false,
                    attempts: 1,
                    lastAttempt: new Date(),
                },
            });
            if (webhook.maxRetries > 1) {
                await this.scheduleRetry(webhook.id, event, 1);
            }
        }
    }
    async scheduleRetry(webhookId, event, attempt) {
        const delayMinutes = Math.pow(2, attempt - 1);
        const nextRetry = new Date(Date.now() + delayMinutes * 60 * 1000);
        console.log(`Webhook retry agendado para ${nextRetry} (tentativa ${attempt + 1})`);
    }
    generateSecretKey() {
        return crypto.randomBytes(32).toString('hex');
    }
    createSignature(payload, secret) {
        const data = JSON.stringify(payload);
        return crypto.createHmac('sha256', secret).update(data).digest('hex');
    }
    toDomain(webhook) {
        return {
            id: webhook.id,
            userId: webhook.userId,
            url: webhook.url,
            description: webhook.description,
            eventPaymentCreated: webhook.eventPaymentCreated,
            eventPaymentCompleted: webhook.eventPaymentCompleted,
            eventWithdrawCompleted: webhook.eventWithdrawCompleted,
            eventRefund: webhook.eventRefund,
            isActive: webhook.isActive,
            secretKey: webhook.secretKey,
            maxRetries: webhook.maxRetries,
            timeoutSeconds: webhook.timeoutSeconds,
            createdAt: webhook.createdAt,
            updatedAt: webhook.updatedAt,
        };
    }
    toDeliveryDomain(delivery) {
        return {
            id: delivery.id,
            webhookId: delivery.webhookId,
            eventType: delivery.eventType,
            payload: delivery.payload,
            responseCode: delivery.responseCode,
            responseBody: delivery.responseBody,
            success: delivery.success,
            attempts: delivery.attempts,
            lastAttempt: delivery.lastAttempt,
            nextRetry: delivery.nextRetry,
            createdAt: delivery.createdAt,
        };
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map