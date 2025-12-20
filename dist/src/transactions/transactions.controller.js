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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const webhook_dto_1 = require("./dto/webhook.dto");
const pagination_query_dto_1 = require("./dto/pagination-query.dto");
const transactions_service_1 = require("./transactions.service");
const public_decorator_1 = require("../auth/public.decorator");
const user_decorator_1 = require("../auth/user.decorator");
const require_permission_decorator_1 = require("../api-keys/decorators/require-permission.decorator");
const api_key_permission_guard_1 = require("../api-keys/guards/api-key-permission.guard");
const api_key_permission_enum_1 = require("../api-keys/enums/api-key-permission.enum");
let TransactionsController = class TransactionsController {
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async getMyTransactions(user, query) {
        return this.transactionsService.getTransactionsPaginated(user.id, query);
    }
    async processTransaction(dto) {
        return this.transactionsService.processTransaction(dto);
    }
    async getTransactionsByUser(userId) {
        return this.transactionsService.getTransactionsByUser(userId);
    }
    async processWebhook(webhookData) {
        return this.transactionsService.processWebhook(webhookData);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getMyTransactions", null);
__decorate([
    (0, common_1.Post)('process'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(api_key_permission_guard_1.ApiKeyPermissionGuard),
    (0, require_permission_decorator_1.RequirePermission)(api_key_permission_enum_1.ApiKeyPermission.TRANSACOES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "processTransaction", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransactionsByUser", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [webhook_dto_1.WebhookDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "processWebhook", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map