import { IsEmail, IsNotEmpty, IsNumber, IsIn, IsString, IsOptional, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateTransactionDto {
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
  @IsIn(['pix', 'card'])
  paymentMethod: 'pix' | 'card';

  @IsOptional()
  @IsString()
  description?: string;

  // Dados do pagador
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerDocument?: string;

  // Dados obrigatórios para transações
  @IsNotEmpty()
  @IsIn(['pf', 'pj'])
  customerType: 'pf' | 'pj'; // Pessoa Física ou Jurídica

  @IsNotEmpty()
  @IsString()
  customerTaxId: string; // CPF ou CNPJ unificado

  // Endereço obrigatório
  @IsNotEmpty()
  @IsString()
  customerStreet: string;

  @IsNotEmpty()
  @IsString()
  customerNumber: string;

  @IsOptional()
  @IsString()
  customerComplement?: string;

  @IsNotEmpty()
  @IsString()
  customerNeighborhood: string;

  @IsNotEmpty()
  @IsString()
  customerCity: string;

  @IsNotEmpty()
  @IsString()
  customerState: string;

  @IsNotEmpty()
  @IsString()
  customerZipCode: string;

  // Dados específicos do cartão (quando aplicável)
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @IsOptional()
  @IsString()
  cardHolderName?: string;

  @IsOptional()
  @IsString()
  cardExpiryMonth?: string;

  @IsOptional()
  @IsString()
  cardExpiryYear?: string;

  @IsOptional()
  @IsString()
  cardCvv?: string;

  // Items da transação
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items?: TransactionItemDto[];
}