import { IsOptional, IsString, IsIn } from 'class-validator';

export class DocumentsQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}