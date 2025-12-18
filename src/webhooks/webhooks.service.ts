import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Webhook, WebhookDelivery, WebhookEvent } from './entities/webhook.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWebhookDto): Promise<Webhook> {
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

  async findAll(userId: string): Promise<Webhook[]> {
    const webhooks = await this.prisma.webhook.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return webhooks.map(this.toDomain);
  }

  async findOne(id: string, userId: string): Promise<Webhook> {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, userId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook não encontrado');
    }

    return this.toDomain(webhook);
  }

  async update(id: string, userId: string, dto: UpdateWebhookDto): Promise<Webhook> {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, userId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook não encontrado');
    }

    const updated = await this.prisma.webhook.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, userId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook não encontrado');
    }

    await this.prisma.webhook.delete({
      where: { id },
    });
  }

  async getDeliveries(
    webhookId: string, 
    userId: string,
    options?: { limit?: number; eventType?: string }
  ): Promise<WebhookDelivery[]> {
    // Verificar se o webhook pertence ao usuário
    const webhook = await this.findOne(webhookId, userId);

    const deliveries = await this.prisma.webhookDelivery.findMany({
      where: {
        webhookId,
        ...(options?.eventType && { eventType: options.eventType }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
    });

    return deliveries.map(this.toDeliveryDomain);
  }

  async triggerWebhook(event: WebhookEvent): Promise<void> {
    // Buscar webhooks ativos do usuário que têm o evento habilitado
    const eventFieldMap = {
      'payment_created': 'eventPaymentCreated',
      'payment_completed': 'eventPaymentCompleted',
      'withdraw_completed': 'eventWithdrawCompleted',
      'refund': 'eventRefund',
    };

    const eventField = eventFieldMap[event.eventType];
    if (!eventField) return;

    const webhooks = await this.prisma.webhook.findMany({
      where: {
        userId: event.userId,
        isActive: true,
        [eventField]: true,
      },
    });

    // Disparar webhooks
    for (const webhook of webhooks) {
      await this.sendWebhook(webhook, event);
    }
  }

  private async sendWebhook(webhook: any, event: WebhookEvent): Promise<void> {
    const payload = {
      event: event.eventType,
      data: event.data,
      timestamp: event.timestamp,
      webhook_id: webhook.id,
    };

    // Criar signature se há secret key
    let signature: string | undefined;
    if (webhook.secretKey) {
      signature = this.createSignature(payload, webhook.secretKey);
    }

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(signature && { 'X-Webhook-Signature': signature }),
          'User-Agent': 'Spinmaaser-Webhooks/1.0',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(webhook.timeoutSeconds * 1000),
      });

      // Registrar entrega
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

      // Se falhou e há tentativas restantes, agendar retry
      if (!response.ok && webhook.maxRetries > 1) {
        await this.scheduleRetry(webhook.id, event, 1);
      }

    } catch (error) {
      // Registrar falha
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

      // Agendar retry se há tentativas restantes
      if (webhook.maxRetries > 1) {
        await this.scheduleRetry(webhook.id, event, 1);
      }
    }
  }

  private async scheduleRetry(webhookId: string, event: WebhookEvent, attempt: number): Promise<void> {
    // Exponential backoff: 1min, 2min, 4min, 8min...
    const delayMinutes = Math.pow(2, attempt - 1);
    const nextRetry = new Date(Date.now() + delayMinutes * 60 * 1000);

    // Implementar lógica de retry queue aqui
    // Por simplicidade, apenas registramos o próximo retry
    console.log(`Webhook retry agendado para ${nextRetry} (tentativa ${attempt + 1})`);
  }

  private generateSecretKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private createSignature(payload: any, secret: string): string {
    const data = JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  private toDomain(webhook: any): Webhook {
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

  private toDeliveryDomain(delivery: any): WebhookDelivery {
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
}