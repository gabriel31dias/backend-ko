import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class AdminTransactionsQueryDto {
  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  limit?: string = '20';

  @IsOptional()
  @IsIn(['pending', 'waiting', 'approved', 'rejected'])
  status?: string;

  @IsOptional()
  @IsIn(['pix', 'card'])
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}