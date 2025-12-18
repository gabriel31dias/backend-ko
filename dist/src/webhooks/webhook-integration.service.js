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
exports.WebhookIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const webhooks_service_1 = require("./webhooks.service");
let WebhookIntegrationService = class WebhookIntegrationService {
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
    }
    async onPaymentCreated(transaction) {
        const event = {
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
    async onPaymentCompleted(transaction) {
        const event = {
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
    async onWithdrawCompleted(withdrawal) {
        var _a, _b, _c, _d;
        const event = {
            eventType: 'withdraw_completed',
            data: {
                id: withdrawal.id,
                amount: withdrawal.amount,
                bankAccount: {
                    bank: (_a = withdrawal.bankAccount) === null || _a === void 0 ? void 0 : _a.bank,
                    agency: (_b = withdrawal.bankAccount) === null || _b === void 0 ? void 0 : _b.agency,
                    account: (_c = withdrawal.bankAccount) === null || _c === void 0 ? void 0 : _c.account,
                    accountType: (_d = withdrawal.bankAccount) === null || _d === void 0 ? void 0 : _d.accountType,
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
    async onRefund(refund) {
        const event = {
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
};
exports.WebhookIntegrationService = WebhookIntegrationService;
exports.WebhookIntegrationService = WebhookIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhookIntegrationService);
//# sourceMappingURL=webhook-integration.service.js.map