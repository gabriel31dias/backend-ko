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
exports.WalletMovementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WalletMovementService = class WalletMovementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createMovement(data) {
        const user = await this.prisma.user.findUnique({
            where: { id: data.userId },
            select: { walletBalance: true },
        });
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        const balanceBefore = user.walletBalance;
        const balanceAfter = data.type === 'credit'
            ? balanceBefore + data.amount
            : balanceBefore - data.amount;
        const movement = await this.prisma.walletMovement.create({
            data: {
                userId: data.userId,
                type: data.type,
                category: data.category,
                amount: data.amount,
                balanceBefore,
                balanceAfter,
                description: data.description,
                referenceType: data.referenceType,
                referenceId: data.referenceId,
                metadata: data.metadata,
            },
        });
        return this.toDomain(movement);
    }
    async createTransactionMovements(userId, transactionId, grossAmount, netAmount, fees) {
        const movements = [];
        const creditMovement = await this.createMovement({
            userId,
            type: 'credit',
            category: 'transaction_credit',
            amount: netAmount,
            description: `Recebimento de transação - Valor líquido`,
            referenceType: 'transaction',
            referenceId: transactionId,
            metadata: {
                grossAmount,
                netAmount,
                fees,
            },
        });
        movements.push(creditMovement);
        if (fees.totalFees > 0) {
            const feeMovement = await this.createMovement({
                userId,
                type: 'debit',
                category: 'transaction_fee',
                amount: fees.totalFees,
                description: `Taxa de transação (Fixa: R$ ${fees.fixedFeeAmount.toFixed(2)} + Percentual: R$ ${fees.percentageFeeAmount.toFixed(2)})`,
                referenceType: 'transaction',
                referenceId: transactionId,
                metadata: {
                    fixedFee: fees.fixedFeeAmount,
                    percentageFee: fees.percentageFeeAmount,
                    totalFees: fees.totalFees,
                },
            });
            movements.push(feeMovement);
        }
        return movements;
    }
    async getStatement(userId, options) {
        const from = (options === null || options === void 0 ? void 0 : options.from) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const to = (options === null || options === void 0 ? void 0 : options.to) || new Date();
        const movements = await this.prisma.walletMovement.findMany({
            where: Object.assign({ userId, createdAt: {
                    gte: from,
                    lte: to,
                } }, ((options === null || options === void 0 ? void 0 : options.category) && { category: options.category })),
            orderBy: { createdAt: 'desc' },
            take: (options === null || options === void 0 ? void 0 : options.limit) || 100,
        });
        const totalCredits = movements
            .filter(m => m.type === 'credit')
            .reduce((sum, m) => sum + m.amount, 0);
        const totalDebits = movements
            .filter(m => m.type === 'debit')
            .reduce((sum, m) => sum + m.amount, 0);
        const netMovement = totalCredits - totalDebits;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { walletBalance: true },
        });
        return {
            movements: movements.map(m => this.toDomain(m)),
            summary: {
                totalCredits,
                totalDebits,
                netMovement,
                currentBalance: (user === null || user === void 0 ? void 0 : user.walletBalance) || 0,
            },
            period: { from, to },
        };
    }
    async getMovementsByTransaction(transactionId) {
        const movements = await this.prisma.walletMovement.findMany({
            where: { referenceId: transactionId },
            orderBy: { createdAt: 'asc' },
        });
        return movements.map(m => this.toDomain(m));
    }
    toDomain(movement) {
        return {
            id: movement.id,
            userId: movement.userId,
            type: movement.type,
            category: movement.category,
            amount: movement.amount,
            balanceBefore: movement.balanceBefore,
            balanceAfter: movement.balanceAfter,
            description: movement.description,
            referenceType: movement.referenceType,
            referenceId: movement.referenceId,
            metadata: movement.metadata,
            createdAt: movement.createdAt,
        };
    }
};
exports.WalletMovementService = WalletMovementService;
exports.WalletMovementService = WalletMovementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletMovementService);
//# sourceMappingURL=wallet-movement.service.js.map