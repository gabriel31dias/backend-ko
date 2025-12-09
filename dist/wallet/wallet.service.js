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
let WalletService = class WalletService {
    constructor(usersService, walletMovementService, prisma) {
        this.usersService = usersService;
        this.walletMovementService = walletMovementService;
        this.prisma = prisma;
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
    async getBalance(userId) {
        const user = await this.usersService.findById(userId);
        const averageTicket = await this.calculateAverageTicket(userId);
        return {
            userId: user.id,
            balance: user.wallet.balance,
            grossBalance: user.wallet.grossBalance,
            currency: user.wallet.currency,
            averageTicketSold: averageTicket,
            refundFee: 0,
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
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        wallet_movement_service_1.WalletMovementService,
        prisma_service_1.PrismaService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map