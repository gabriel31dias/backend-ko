import { IsOptional, IsNumberString, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @IsOptional()
  @IsNumberString()
  limit?: string = '10';

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  startDate?: string; // Aceita YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss

  @IsOptional()
  @IsString()
  endDate?: string; // Aceita YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss

  @IsOptional()
  @IsString()
  customerName?: string; // Busca por nome do cliente

  @IsOptional()
  @IsString()
  search?: string; // Busca geral por nome, email, CPF ou CNPJ
}