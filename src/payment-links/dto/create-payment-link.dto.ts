import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePaymentLinkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsIn(['BRL', 'USD', 'EUR'])
  currency: 'BRL' | 'USD' | 'EUR';

  @IsOptional()
  @IsString()
  expiresIn?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxUses?: number;

  @IsBoolean()
  requireEmail: boolean;

  @IsBoolean()
  requirePhone: boolean;

  @IsBoolean()
  allowCustomAmount: boolean;

  @IsOptional()
  @IsString()
  brandColor?: string;

  @IsOptional()
  @IsString()
  accentColor?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;
}
