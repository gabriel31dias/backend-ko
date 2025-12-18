import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateApiKeyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}