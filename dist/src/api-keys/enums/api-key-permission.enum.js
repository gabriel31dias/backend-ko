"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_DESCRIPTIONS = exports.ApiKeyPermission = void 0;
var ApiKeyPermission;
(function (ApiKeyPermission) {
    ApiKeyPermission["TRANSACOES"] = "transacoes";
    ApiKeyPermission["SAQUE"] = "saque";
    ApiKeyPermission["TODOS"] = "todos";
})(ApiKeyPermission || (exports.ApiKeyPermission = ApiKeyPermission = {}));
exports.PERMISSION_DESCRIPTIONS = {
    [ApiKeyPermission.TRANSACOES]: 'Permite criar e consultar transações',
    [ApiKeyPermission.SAQUE]: 'Permite realizar e consultar saques',
    [ApiKeyPermission.TODOS]: 'Acesso completo a todas as funcionalidades'
};
//# sourceMappingURL=api-key-permission.enum.js.map