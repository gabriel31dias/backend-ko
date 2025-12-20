import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeysService } from '../api-keys.service';
import { ApiKeyPermission } from '../enums/api-key-permission.enum';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class ApiKeyPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private apiKeysService: ApiKeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<ApiKeyPermission>(
      REQUIRE_PERMISSION_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true; // Se não há permissão exigida, permite acesso
    }

    const request = context.switchToHttp().getRequest();
    const { publicKey, secretKey } = request.body;

    if (!publicKey || !secretKey) {
      throw new ForbiddenException('API keys são obrigatórias');
    }

    try {
      const apiKey = await this.apiKeysService.validateApiKey(publicKey, secretKey);
      
      if (!apiKey) {
        throw new ForbiddenException('API keys inválidas');
      }

      if (!apiKey.isActive) {
        throw new ForbiddenException('API key desabilitada');
      }

      if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
        throw new ForbiddenException('API key expirada');
      }

      // Verificar se tem a permissão necessária ou se tem permissão TODOS
      if (apiKey.permissions !== requiredPermission && apiKey.permissions !== ApiKeyPermission.TODOS) {
        throw new ForbiddenException(`Permissão '${requiredPermission}' necessária`);
      }

      // Adicionar dados da API key no request para uso posterior
      request.apiKey = apiKey;
      
      return true;
    } catch (error) {
      throw new ForbiddenException(error.message || 'Erro ao validar permissões');
    }
  }
}