import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsIn } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNotEmpty()
  @IsString()
  publicKey: string;

  @IsNotEmpty()
  @IsString()
  secretKey: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsIn(['pix', 'bank_transfer'])
  method: 'pix' | 'bank_transfer';

  @IsOptional()
  @IsString()
  description?: string;

  // Dados bancários para transferência
  @IsOptional()
  @IsString()
  bankCode?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  accountDigit?: string;

  @IsOptional()
  @IsString()
  agency?: string;

  @IsOptional()
  @IsString()
  agencyDigit?: string;

  @IsOptional()
  @IsString()
  accountHolderName?: string;

  @IsOptional()
  @IsString()
  accountHolderDocument?: string;

  // Dados PIX
  @IsOptional()
  @IsString()
  pixKey?: string;

  @IsOptional()
  @IsIn(['cpf', 'cnpj', 'email', 'phone', 'random'])
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
}