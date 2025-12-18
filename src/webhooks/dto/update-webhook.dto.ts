import { IsString, IsUrl, IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateWebhookDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  eventPaymentCreated?: boolean;

  @IsOptional()
  @IsBoolean()
  eventPaymentCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  eventWithdrawCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  eventRefund?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  secretKey?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxRetries?: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(300)
  timeoutSeconds?: number;
}