import { IsNotEmpty, IsString, IsIn, IsNumber } from 'class-validator';

export class WebhookDto {
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @IsNotEmpty()
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsString()
  paymentMethod?: string;

  @IsString()
  externalId?: string;
}