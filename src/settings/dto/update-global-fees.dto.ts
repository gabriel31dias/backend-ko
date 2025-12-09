import { IsNumber, Min } from 'class-validator';

export class UpdateGlobalFeesDto {
  @IsNumber()
  @Min(0)
  fixedFee: number;

  @IsNumber()
  @Min(0)
  percentageFee: number;
}