import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsIn, IsNumber, IsString, Matches, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;
}

class DocumentsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: 'CPF deve estar no formato XXX.XXX.XXX-XX' })
  cpf?: string;
}

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(['Infoproduto', 'Produto Físico', 'Dropshipping', 'Serviços', 'Outros'])
  operationType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  averageTicket?: number;

  @IsOptional()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: 'CPF deve estar no formato XXX.XXX.XXX-XX' })
  cpf?: string;

  @IsOptional()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX' })
  cnpj?: string;

  @IsOptional()
  @IsString()
  corporateName?: string;

  @IsOptional()
  @IsString()
  salesPageLink?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DocumentsDto)
  documents?: DocumentsDto;
}
