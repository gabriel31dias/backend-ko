import { SetMetadata } from '@nestjs/common';
import { ApiKeyPermission } from '../enums/api-key-permission.enum';

export const REQUIRE_PERMISSION_KEY = 'require_permission';
export const RequirePermission = (permission: ApiKeyPermission) => 
  SetMetadata(REQUIRE_PERMISSION_KEY, permission);