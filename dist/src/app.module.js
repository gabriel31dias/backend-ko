"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const wallet_module_1 = require("./wallet/wallet.module");
const payment_links_module_1 = require("./payment-links/payment-links.module");
const transactions_module_1 = require("./transactions/transactions.module");
const settings_module_1 = require("./settings/settings.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const prisma_module_1 = require("./prisma/prisma.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const api_keys_module_1 = require("./api-keys/api-keys.module");
const admin_module_1 = require("./admin/admin.module");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, users_module_1.UsersModule, auth_module_1.AuthModule, wallet_module_1.WalletModule, payment_links_module_1.PaymentLinksModule, transactions_module_1.TransactionsModule, settings_module_1.SettingsModule, webhooks_module_1.WebhooksModule, dashboard_module_1.DashboardModule, api_keys_module_1.ApiKeysModule, admin_module_1.AdminModule],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map