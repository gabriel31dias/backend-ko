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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardMetrics(query) {
        const { startDate, endDate } = this.calculateDateRange(query);
        const whereCondition = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: 'approved',
        };
        const [transactionsWithoutDiscount, transactionsWithDiscount, totalCount, cardTransactions, pixTransactions] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: Object.assign(Object.assign({}, whereCondition), { OR: [
                        { totalFeesApplied: null },
                        { totalFeesApplied: 0 }
                    ] }),
                _sum: { amount: true }
            }),
            this.prisma.transaction.aggregate({
                where: Object.assign(Object.assign({}, whereCondition), { totalFeesApplied: { gt: 0 } }),
                _sum: { amount: true }
            }),
            this.prisma.transaction.count({
                where: whereCondition
            }),
            this.prisma.transaction.aggregate({
                where: Object.assign(Object.assign({}, whereCondition), { paymentMethod: 'card' }),
                _sum: { amount: true }
            }),
            this.prisma.transaction.aggregate({
                where: Object.assign(Object.assign({}, whereCondition), { paymentMethod: 'pix' }),
                _sum: { amount: true }
            })
        ]);
        return {
            totalTransactionsWithoutDiscount: transactionsWithoutDiscount._sum.amount || 0,
            totalTransactionsWithDiscount: transactionsWithDiscount._sum.amount || 0,
            totalTransactionsCount: totalCount,
            totalByPaymentMethod: {
                card: cardTransactions._sum.amount || 0,
                pix: pixTransactions._sum.amount || 0
            },
            period: {
                start: startDate,
                end: endDate
            }
        };
    }
    async getAllTransactions(query) {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '20');
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.paymentMethod) {
            where.paymentMethod = query.paymentMethod;
        }
        if (query.customerName) {
            where.customerName = {
                contains: query.customerName,
                mode: 'insensitive',
            };
        }
        if (query.userId) {
            where.receiverUserId = query.userId;
        }
        if (query.transactionId) {
            where.transactionId = {
                contains: query.transactionId,
                mode: 'insensitive',
            };
        }
        if (query.search) {
            where.OR = [
                {
                    customerName: {
                        contains: query.search,
                        mode: 'insensitive',
                    },
                },
                {
                    customerEmail: {
                        contains: query.search,
                        mode: 'insensitive',
                    },
                },
                {
                    customerTaxId: {
                        contains: query.search,
                        mode: 'insensitive',
                    },
                },
                {
                    transactionId: {
                        contains: query.search,
                        mode: 'insensitive',
                    },
                },
            ];
        }
        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate) {
                const startDate = query.startDate.includes('T') ?
                    new Date(query.startDate) :
                    new Date(query.startDate + 'T00:00:00');
                where.createdAt.gte = startDate;
            }
            if (query.endDate) {
                const endDate = query.endDate.includes('T') ?
                    new Date(query.endDate) :
                    new Date(query.endDate + 'T23:59:59');
                where.createdAt.lte = endDate;
            }
        }
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                include: {
                    receiver: {
                        select: {
                            name: true,
                            email: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.transaction.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            transactions: transactions.map(t => ({
                id: t.id,
                amount: t.amount,
                paymentMethod: t.paymentMethod,
                status: t.status,
                transactionId: t.transactionId,
                description: t.description,
                customerName: t.customerName,
                customerEmail: t.customerEmail,
                customerPhone: t.customerPhone,
                customerDocument: t.customerDocument,
                customerType: t.customerType,
                customerTaxId: t.customerTaxId,
                receiverUserId: t.receiverUserId,
                receiverUserName: t.receiver.name,
                receiverUserEmail: t.receiver.email,
                createdAt: t.createdAt,
                approvedAt: t.approvedAt,
                grossAmount: t.grossAmount,
                fixedFeeApplied: t.fixedFeeApplied,
                percentageFeeApplied: t.percentageFeeApplied,
                totalFeesApplied: t.totalFeesApplied,
                netAmount: t.netAmount,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
    calculateDateRange(query) {
        let startDate;
        let endDate;
        if (query.startDate && query.endDate) {
            startDate = new Date(query.startDate + 'T00:00:00');
            endDate = new Date(query.endDate + 'T23:59:59');
            const maxStartDate = new Date();
            maxStartDate.setMonth(maxStartDate.getMonth() - 3);
            if (startDate < maxStartDate) {
                startDate = maxStartDate;
            }
        }
        else {
            const today = new Date();
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        }
        return { startDate, endDate };
    }
    async getRecentTransactions() {
        const transactions = await this.prisma.transaction.findMany({
            include: {
                receiver: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        return transactions.map(t => ({
            id: t.id,
            amount: t.amount,
            paymentMethod: t.paymentMethod,
            status: t.status,
            transactionId: t.transactionId,
            description: t.description,
            customerName: t.customerName,
            customerEmail: t.customerEmail,
            customerPhone: t.customerPhone,
            customerDocument: t.customerDocument,
            customerType: t.customerType,
            customerTaxId: t.customerTaxId,
            receiverUserId: t.receiverUserId,
            receiverUserName: t.receiver.name,
            receiverUserEmail: t.receiver.email,
            createdAt: t.createdAt,
            approvedAt: t.approvedAt,
            grossAmount: t.grossAmount,
            fixedFeeApplied: t.fixedFeeApplied,
            percentageFeeApplied: t.percentageFeeApplied,
            totalFeesApplied: t.totalFeesApplied,
            netAmount: t.netAmount,
        }));
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map