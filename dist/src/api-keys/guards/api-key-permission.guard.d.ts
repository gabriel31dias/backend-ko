import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeysService } from '../api-keys.service';
export declare class ApiKeyPermissionGuard implements CanActivate {
    private reflector;
    private apiKeysService;
    constructor(reflector: Reflector, apiKeysService: ApiKeysService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=api-key-permission.guard.d.ts.map