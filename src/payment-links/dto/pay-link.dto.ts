import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class PayLinkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  payerName: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsIn(['card', 'pix'])
  paymentMethod: 'card' | 'pix';

  @IsOptional()
  @IsString()
  @MinLength(12)
  cardNumber?: string;

  @IsOptional()
  @IsString()
  cardHolder?: string;

  @IsOptional()
  @IsString()
  cardExpiration?: string;

  @IsOptional()
  @IsString()
  cardCvv?: string;
}
