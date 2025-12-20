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
exports.ApiKeyPermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const api_keys_service_1 = require("../api-keys.service");
const api_key_permission_enum_1 = require("../enums/api-key-permission.enum");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
let ApiKeyPermissionGuard = class ApiKeyPermissionGuard {
    constructor(reflector, apiKeysService) {
        this.reflector = reflector;
        this.apiKeysService = apiKeysService;
    }
    async canActivate(context) {
        const requiredPermission = this.reflector.get(require_permission_decorator_1.REQUIRE_PERMISSION_KEY, context.getHandler());
        if (!requiredPermission) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const { publicKey, secretKey } = request.body;
        if (!publicKey || !secretKey) {
            throw new common_1.ForbiddenException('API keys são obrigatórias');
        }
        try {
            const apiKey = await this.apiKeysService.validateApiKey(publicKey, secretKey);
            if (!apiKey) {
                throw new common_1.ForbiddenException('API keys inválidas');
            }
            if (!apiKey.isActive) {
                throw new common_1.ForbiddenException('API key desabilitada');
            }
            if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
                throw new common_1.ForbiddenException('API key expirada');
            }
            if (apiKey.permissions !== requiredPermission && apiKey.permissions !== api_key_permission_enum_1.ApiKeyPermission.TODOS) {
                throw new common_1.ForbiddenException(`Permissão '${requiredPermission}' necessária`);
            }
            request.apiKey = apiKey;
            return true;
        }
        catch (error) {
            throw new common_1.ForbiddenException(error.message || 'Erro ao validar permissões');
        }
    }
};
exports.ApiKeyPermissionGuard = ApiKeyPermissionGuard;
exports.ApiKeyPermissionGuard = ApiKeyPermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        api_keys_service_1.ApiKeysService])
], ApiKeyPermissionGuard);
//# sourceMappingURL=api-key-permission.guard.js.map