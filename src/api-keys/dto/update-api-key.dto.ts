import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class UpdateApiKeyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}