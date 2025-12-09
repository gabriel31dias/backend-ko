import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateFeesDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  percentageFee?: number;
}