import { IsOptional, IsString, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { ApiKeyPermission } from '../enums/api-key-permission.enum';

export class UpdateApiKeyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(ApiKeyPermission)
  permissions?: ApiKeyPermission;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}