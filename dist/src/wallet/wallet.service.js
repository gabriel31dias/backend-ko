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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const wallet_movement_service_1 = require("./wallet-movement.service");
const prisma_service_1 = require("../prisma/prisma.service");
const api_keys_service_1 = require("../api-keys/api-keys.service");
let WalletService = class WalletService {
    constructor(usersService, walletMovementService, prisma, apiKeysService) {
        this.usersService = usersService;
        this.walletMovementService = walletMovementService;
        this.prisma = prisma;
        this.apiKeysService = apiKeysService;
    }
    async getWalletSummary(userId) {
        const user = await this.usersService.findById(userId);
        const averageTicket = await this.calculateAverageTicket(userId);
        return {
            userId: user.id,
            currency: user.wallet.currency,
            saldoAtual: user.wallet.balance,
            grossBalance: user.wallet.grossBalance,
            valorReceber: user.wallet.valorReceber,
            averageTicketSold: averageTicket,
            refundFee: 0,
        };
    }
    async getStatement(userId, options) {
        const statementOptions = {
            from: (options === null || options === void 0 ? void 0 : options.from) ? new Date(options.from) : undefined,
            to: (options === null || options === void 0 ? void 0 : options.to) ? new Date(options.to) : undefined,
            limit: options === null || options === void 0 ? void 0 : options.limit,
            category: options === null || options === void 0 ? void 0 : options.category,
        };
        return this.walletMovementService.getStatement(userId, statementOptions);
    }
    async getBalance(userId, options) {
        const user = await this.usersService.findById(userId);
        let fromDate = this.parseDate(options === null || options === void 0 ? void 0 : options.from, 'from');
        let toDate = this.parseDate(options === null || options === void 0 ? void 0 : options.to, 'to');
        if (!fromDate && !toDate) {
            const now = new Date();
            fromDate = new Date(now);
            fromDate.setDate(now.getDate() - 7);
            fromDate.setHours(0, 0, 0, 0);
            toDate = new Date(now);
            toDate.setHours(23, 59, 59, 999);
        }
        if (fromDate && toDate && fromDate > toDate) {
            throw new common_1.BadRequestException('Data inicial não pode ser maior que a data final');
        }
        const createdAtFilter = fromDate || toDate
            ? Object.assign(Object.assign({}, (fromDate && { gte: fromDate })), (toDate && { lte: toDate })) : undefined;
        const [creditsAggregate, debitsAggregate, salesCount, transactionsAggregate] = await Promise.all([
            this.prisma.walletMovement.aggregate({
                where: Object.assign({ userId, type: 'credit' }, (createdAtFilter && { createdAt: createdAtFilter })),
                _sum: { amount: true },
            }),
            this.prisma.walletMovement.aggregate({
                where: Object.assign({ userId, type: 'debit' }, (createdAtFilter && { createdAt: createdAtFilter })),
                _sum: { amount: true },
            }),
            this.prisma.transaction.count({
                where: Object.assign({ receiverUserId: userId, status: 'approved' }, (createdAtFilter && { createdAt: createdAtFilter })),
            }),
            this.prisma.transaction.aggregate({
                where: Object.assign({ receiverUserId: userId, status: 'approved' }, (createdAtFilter && { createdAt: createdAtFilter })),
                _sum: { amount: true },
            }),
        ]);
        const periodCredits = creditsAggregate._sum.amount || 0;
        const periodDebits = debitsAggregate._sum.amount || 0;
        const netMovement = periodCredits - periodDebits;
        const grossBalance = transactionsAggregate._sum.amount || 0;
        const averageTicketSold = salesCount > 0 ? grossBalance / salesCount : 0;
        return {
            userId: user.id,
            balance: netMovement,
            grossBalance: grossBalance,
            currency: user.wallet.currency,
            averageTicketSold: averageTicketSold,
            refundFee: 0,
            from: fromDate,
            to: toDate,
            totalCredits: periodCredits,
            totalDebits: periodDebits,
            netMovement,
            salesCount,
        };
    }
    async calculateAverageTicket(userId) {
        const aggregates = await this.prisma.transaction.aggregate({
            where: {
                receiverUserId: userId,
                status: 'approved',
            },
            _sum: { amount: true },
            _count: { id: true },
        });
        const totalAmount = aggregates._sum.amount || 0;
        const totalCount = aggregates._count.id || 0;
        return totalCount > 0 ? totalAmount / totalCount : 0;
    }
    async createWithdrawal(dto) {
        const { userId } = await this.apiKeysService.validateApiCredentials(dto.publicKey, dto.secretKey);
        const user = await this.usersService.findById(userId);
        if (user.wallet.balance < dto.amount) {
            throw new common_1.BadRequestException('Saldo insuficiente para realizar o saque');
        }
        if (dto.method === 'pix') {
            if (!dto.pixKey || !dto.pixKeyType) {
                throw new common_1.BadRequestException('Dados PIX são obrigatórios para saque via PIX');
            }
        }
        else if (dto.method === 'bank_transfer') {
            if (!dto.bankCode || !dto.accountNumber || !dto.agency || !dto.accountHolderName) {
                throw new common_1.BadRequestException('Dados bancários são obrigatórios para transferência bancária');
            }
        }
        const withdrawal = await this.prisma.withdrawal.create({
            data: {
                userId,
                amount: dto.amount,
                method: dto.method,
                status: 'pending',
                description: dto.description,
                bankCode: dto.bankCode,
                accountNumber: dto.accountNumber,
                accountDigit: dto.accountDigit,
                agency: dto.agency,
                agencyDigit: dto.agencyDigit,
                accountHolderName: dto.accountHolderName,
                accountHolderDocument: dto.accountHolderDocument,
                pixKey: dto.pixKey,
                pixKeyType: dto.pixKeyType,
            },
        });
        await this.walletMovementService.createMovement({
            userId,
            type: 'debit',
            category: 'withdrawal',
            amount: dto.amount,
            description: dto.description || `Saque via ${dto.method}`,
            referenceType: 'withdrawal',
            referenceId: withdrawal.id,
            metadata: {
                withdrawalId: withdrawal.id,
                method: dto.method,
            },
        });
        return {
            id: withdrawal.id,
            amount: withdrawal.amount,
            method: withdrawal.method,
            status: withdrawal.status,
            description: withdrawal.description,
            createdAt: withdrawal.createdAt,
        };
    }
    parseDate(value, label) {
        if (!value) {
            return undefined;
        }
        const parsed = new Date(value);
        if (isNaN(parsed.getTime())) {
            throw new common_1.BadRequestException(`Data inválida para o parâmetro ${label || 'date'}`);
        }
        if (label === 'to' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            parsed.setUTCHours(23, 59, 59, 999);
        }
        return parsed;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        wallet_movement_service_1.WalletMovementService,
        prisma_service_1.PrismaService,
        api_keys_service_1.ApiKeysService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map