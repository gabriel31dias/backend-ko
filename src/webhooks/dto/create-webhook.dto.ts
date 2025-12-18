import { IsString, IsUrl, IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateWebhookDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  eventPaymentCreated: boolean;

  @IsBoolean()
  eventPaymentCompleted: boolean;

  @IsBoolean()
  eventWithdrawCompleted: boolean;

  @IsBoolean()
  eventRefund: boolean;

  @IsOptional()
  @IsString()
  secretKey?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxRetries?: number = 3;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(300)
  timeoutSeconds?: number = 30;
}