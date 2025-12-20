import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiKeyPermission } from '../enums/api-key-permission.enum';

export class CreateApiKeyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(ApiKeyPermission)
  permissions: ApiKeyPermission;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}