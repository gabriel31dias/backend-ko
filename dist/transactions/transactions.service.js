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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const wallet_movement_service_1 = require("../wallet/wallet-movement.service");
const settings_service_1 = require("../settings/settings.service");
const crypto_1 = require("crypto");
let TransactionsService = class TransactionsService {
    constructor(prisma, usersService, walletMovementService, settingsService) {
        this.prisma = prisma;
        this.usersService = usersService;
        this.walletMovementService = walletMovementService;
        this.settingsService = settingsService;
    }
    async processTransaction(dto) {
        const user = await this.validateApiCredentials(dto.publicKey, dto.secretKey);
        const adquirenteResponse = await this.mockAdquirenteProcess(dto);
        const transaction = await this.createTransaction(dto, user.id, adquirenteResponse);
        let feeSummary;
        if (dto.paymentMethod === 'card' && adquirenteResponse.status === 'approved') {
            feeSummary = await this.updateUserWallet(user.id, dto.amount, adquirenteResponse.transactionId);
            if (feeSummary) {
                transaction.grossAmount = feeSummary.grossAmount;
                transaction.fixedFeeApplied = feeSummary.fixedFeeAmount;
                transaction.percentageFeeApplied = feeSummary.percentageFeeAmount;
                transaction.totalFeesApplied = feeSummary.totalFees;
                transaction.netAmount = feeSummary.netAmount;
            }
        }
        return {
            success: adquirenteResponse.status === 'approved' || adquirenteResponse.status === 'waiting',
            transaction,
            pixCode: adquirenteResponse.pixCode,
            pixQrCode: adquirenteResponse.pixQrCode,
            pixExpiresAt: adquirenteResponse.pixExpiresAt,
            message: adquirenteResponse.message,
            error: adquirenteResponse.error,
        };
    }
    async validateApiCredentials(publicKey, secretKey) {
        const user = await this.prisma.user.findFirst({
            where: {
                publicKey,
                secretKey,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Credenciais de API inválidas');
        }
        return user;
    }
    async mockAdquirenteProcess(dto) {
        const transactionId = `TXN_${(0, crypto_1.randomUUID)().replace(/-/g, '').substring(0, 12)}`;
        if (dto.paymentMethod === 'pix') {
            return this.mockPixResponse(dto, transactionId);
        }
        else {
            return this.mockCardResponse(dto, transactionId);
        }
    }
    async mockPixResponse(dto, transactionId) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const pixCode = this.generateMockPixCode();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        return {
            status: 'waiting',
            transactionId,
            pixCode,
            pixQrCode: `https://mock-qrcode.com/${pixCode}`,
            pixExpiresAt: expiresAt,
            message: 'PIX gerado com sucesso. Aguardando pagamento.',
            authorizationCode: `PIX_${(0, crypto_1.randomUUID)().substring(0, 8)}`,
        };
    }
    async mockCardResponse(dto, transactionId) {
        await new Promise(resolve => setTimeout(resolve, 200));
        if (!dto.cardNumber || !dto.cardHolderName || !dto.cardCvv) {
            return {
                status: 'rejected',
                transactionId,
                error: 'Dados do cartão incompletos',
                message: 'Número, nome do portador e CVV são obrigatórios',
            };
        }
        const isApproved = Math.random() > 0.2;
        if (isApproved) {
            return {
                status: 'approved',
                transactionId,
                authorizationCode: `AUTH_${(0, crypto_1.randomUUID)().substring(0, 10)}`,
                nsu: `NSU_${Math.floor(Math.random() * 1000000)}`,
                message: 'Transação aprovada',
            };
        }
        else {
            const errors = [
                'Cartão sem limite',
                'Cartão bloqueado',
                'Dados inválidos',
                'Emissor indisponível',
            ];
            return {
                status: 'rejected',
                transactionId,
                error: errors[Math.floor(Math.random() * errors.length)],
                message: 'Transação negada pelo emissor',
            };
        }
    }
    generateMockPixCode() {
        return `00020126330014BR.GOV.BCB.PIX${(0, crypto_1.randomUUID)().substring(0, 8)}`;
    }
    async createTransaction(dto, userId, adquirenteResponse) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 2);
        const transaction = await this.prisma.transaction.create({
            data: {
                amount: dto.amount,
                paymentMethod: dto.paymentMethod,
                status: adquirenteResponse.status,
                transactionId: adquirenteResponse.transactionId,
                description: dto.description,
                customerName: dto.customerName,
                customerEmail: dto.customerEmail,
                customerPhone: dto.customerPhone,
                customerDocument: dto.customerDocument,
                customerType: dto.customerType,
                customerTaxId: dto.customerTaxId,
                customerStreet: dto.customerStreet,
                customerNumber: dto.customerNumber,
                customerComplement: dto.customerComplement,
                customerNeighborhood: dto.customerNeighborhood,
                customerCity: dto.customerCity,
                customerState: dto.customerState,
                customerZipCode: dto.customerZipCode,
                receiverUserId: userId,
                pixCode: adquirenteResponse.pixCode,
                pixQrCode: adquirenteResponse.pixQrCode,
                pixExpiresAt: adquirenteResponse.pixExpiresAt,
                authorizationCode: adquirenteResponse.authorizationCode,
                nsu: adquirenteResponse.nsu,
                items: dto.items ? JSON.stringify(dto.items) : null,
                approvedAt: adquirenteResponse.status === 'approved' ? new Date() : null,
            },
        });
        return {
            id: transaction.id,
            amount: transaction.amount,
            paymentMethod: transaction.paymentMethod,
            status: transaction.status,
            transactionId: transaction.transactionId,
            description: transaction.description,
            customerName: transaction.customerName,
            customerEmail: transaction.customerEmail,
            customerPhone: transaction.customerPhone,
            customerDocument: transaction.customerDocument,
            customerType: transaction.customerType,
            customerTaxId: transaction.customerTaxId,
            customerStreet: transaction.customerStreet,
            customerNumber: transaction.customerNumber,
            customerComplement: transaction.customerComplement,
            customerNeighborhood: transaction.customerNeighborhood,
            customerCity: transaction.customerCity,
            customerState: transaction.customerState,
            customerZipCode: transaction.customerZipCode,
            receiverUserId: transaction.receiverUserId,
            createdAt: transaction.createdAt,
            approvedAt: transaction.approvedAt,
            expiresAt: transaction.pixExpiresAt,
            pixCode: transaction.pixCode,
            pixQrCode: transaction.pixQrCode,
            pixExpiresAt: transaction.pixExpiresAt,
            authorizationCode: transaction.authorizationCode,
            nsu: transaction.nsu,
            grossAmount: transaction.grossAmount,
            fixedFeeApplied: transaction.fixedFeeApplied,
            percentageFeeApplied: transaction.percentageFeeApplied,
            totalFeesApplied: transaction.totalFeesApplied,
            netAmount: transaction.netAmount,
            items: transaction.items ? JSON.parse(transaction.items) : null,
        };
    }
    async updateUserWallet(userId, grossAmount, transactionId) {
        const effectiveFees = await this.settingsService.getUserEffectiveFees(userId);
        const fees = this.calculateFees(grossAmount, effectiveFees.fixedFee, effectiveFees.percentageFee);
        if (transactionId) {
            await this.prisma.transaction.update({
                where: { transactionId },
                data: {
                    grossAmount: fees.grossAmount,
                    fixedFeeApplied: fees.fixedFeeAmount,
                    percentageFeeApplied: fees.percentageFeeAmount,
                    totalFeesApplied: fees.totalFees,
                    netAmount: fees.netAmount,
                },
            });
            await this.walletMovementService.createTransactionMovements(userId, transactionId, grossAmount, fees.netAmount, {
                fixedFeeAmount: fees.fixedFeeAmount,
                percentageFeeAmount: fees.percentageFeeAmount,
                totalFees: fees.totalFees,
            });
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                walletBalance: {
                    increment: fees.netAmount,
                },
                walletGrossBalance: {
                    increment: grossAmount,
                },
            },
        });
        return fees;
    }
    calculateFees(grossAmount, fixedFee, percentageFee) {
        const fixedFeeAmount = fixedFee || 0;
        const percentageFeeAmount = (grossAmount * (percentageFee || 0)) / 100;
        const totalFees = fixedFeeAmount + percentageFeeAmount;
        const netAmount = Math.max(0, grossAmount - totalFees);
        return {
            grossAmount,
            fixedFeeAmount,
            percentageFeeAmount,
            totalFees,
            netAmount,
        };
    }
    async processWebhook(webhookData) {
        try {
            const transaction = await this.prisma.transaction.findFirst({
                where: { transactionId: webhookData.transactionId },
                include: { receiver: true },
            });
            if (!transaction) {
                return { success: false, message: 'Transação não encontrada' };
            }
            if (transaction.status !== 'waiting') {
                return { success: false, message: 'Transação já processada' };
            }
            if (Math.abs(transaction.amount - webhookData.amount) > 0.01) {
                return { success: false, message: 'Valor divergente' };
            }
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: webhookData.status,
                    approvedAt: webhookData.status === 'approved' ? new Date() : null,
                },
            });
            if (webhookData.status === 'approved') {
                await this.updateUserWallet(transaction.receiverUserId, transaction.amount, transaction.transactionId);
            }
            return {
                success: true,
                message: `Transação ${webhookData.status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`,
            };
        }
        catch (error) {
            return { success: false, message: 'Erro interno do servidor' };
        }
    }
    async getTransactionsPaginated(userId, query) {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '10');
        const skip = (page - 1) * limit;
        const where = {
            receiverUserId: userId
        };
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
                    customerDocument: {
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
                customerStreet: t.customerStreet,
                customerNumber: t.customerNumber,
                customerComplement: t.customerComplement,
                customerNeighborhood: t.customerNeighborhood,
                customerCity: t.customerCity,
                customerState: t.customerState,
                customerZipCode: t.customerZipCode,
                receiverUserId: t.receiverUserId,
                createdAt: t.createdAt,
                approvedAt: t.approvedAt,
                expiresAt: t.pixExpiresAt,
                pixCode: t.pixCode,
                pixQrCode: t.pixQrCode,
                pixExpiresAt: t.pixExpiresAt,
                authorizationCode: t.authorizationCode,
                nsu: t.nsu,
                grossAmount: t.grossAmount,
                fixedFeeApplied: t.fixedFeeApplied,
                percentageFeeApplied: t.percentageFeeApplied,
                totalFeesApplied: t.totalFeesApplied,
                netAmount: t.netAmount,
                items: t.items,
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
    async getTransactionsByUser(userId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { receiverUserId: userId },
            orderBy: { createdAt: 'desc' },
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
            customerStreet: t.customerStreet,
            customerNumber: t.customerNumber,
            customerComplement: t.customerComplement,
            customerNeighborhood: t.customerNeighborhood,
            customerCity: t.customerCity,
            customerState: t.customerState,
            customerZipCode: t.customerZipCode,
            receiverUserId: t.receiverUserId,
            createdAt: t.createdAt,
            approvedAt: t.approvedAt,
            expiresAt: t.pixExpiresAt,
            pixCode: t.pixCode,
            pixQrCode: t.pixQrCode,
            pixExpiresAt: t.pixExpiresAt,
            authorizationCode: t.authorizationCode,
            nsu: t.nsu,
            grossAmount: t.grossAmount,
            fixedFeeApplied: t.fixedFeeApplied,
            percentageFeeApplied: t.percentageFeeApplied,
            totalFeesApplied: t.totalFeesApplied,
            netAmount: t.netAmount,
            items: t.items ? JSON.parse(t.items) : null,
        }));
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService,
        wallet_movement_service_1.WalletMovementService,
        settings_service_1.SettingsService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map