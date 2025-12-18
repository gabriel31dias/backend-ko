import { Injectable } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookEvent } from './entities/webhook.entity';

@Injectable()
export class WebhookIntegrationService {
  constructor(private readonly webhooksService: WebhooksService) {}

  async onPaymentCreated(transaction: any): Promise<void> {
    const event: WebhookEvent = {
      eventType: 'payment_created',
      data: {
        id: transaction.id,
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        status: transaction.status,
        customerName: transaction.customerName,
        customerEmail: transaction.customerEmail,
        description: transaction.description,
        createdAt: transaction.createdAt,
        expiresAt: transaction.expiresAt,
        pixCode: transaction.pixCode,
        pixQrCode: transaction.pixQrCode,
      },
      userId: transaction.receiverUserId,
      timestamp: new Date(),
    };

    await this.webhooksService.triggerWebhook(event);
  }

  async onPaymentCompleted(transaction: any): Promise<void> {
    const event: WebhookEvent = {
      eventType: 'payment_completed',
      data: {
        id: transaction.id,
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        grossAmount: transaction.grossAmount,
        netAmount: transaction.netAmount,
        totalFeesApplied: transaction.totalFeesApplied,
        fixedFeeApplied: transaction.fixedFeeApplied,
        percentageFeeApplied: transaction.percentageFeeApplied,
        paymentMethod: transaction.paymentMethod,
        status: transaction.status,
        customerName: transaction.customerName,
        customerEmail: transaction.customerEmail,
        description: transaction.description,
        approvedAt: transaction.approvedAt,
        authorizationCode: transaction.authorizationCode,
        nsu: transaction.nsu,
      },
      userId: transaction.receiverUserId,
      timestamp: new Date(),
    };

    await this.webhooksService.triggerWebhook(event);
  }

  async onWithdrawCompleted(withdrawal: any): Promise<void> {
    const event: WebhookEvent = {
      eventType: 'withdraw_completed',
      data: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        bankAccount: {
          bank: withdrawal.bankAccount?.bank,
          agency: withdrawal.bankAccount?.agency,
          account: withdrawal.bankAccount?.account,
          accountType: withdrawal.bankAccount?.accountType,
        },
        status: withdrawal.status,
        processedAt: withdrawal.processedAt,
        transactionId: withdrawal.transactionId,
      },
      userId: withdrawal.userId,
      timestamp: new Date(),
    };

    await this.webhooksService.triggerWebhook(event);
  }

  async onRefund(refund: any): Promise<void> {
    const event: WebhookEvent = {
      eventType: 'refund',
      data: {
        id: refund.id,
        originalTransactionId: refund.originalTransactionId,
        amount: refund.amount,
        reason: refund.reason,
        status: refund.status,
        processedAt: refund.processedAt,
        refundTransactionId: refund.refundTransactionId,
      },
      userId: refund.userId,
      timestamp: new Date(),
    };

    await this.webhooksService.triggerWebhook(event);
  }
}