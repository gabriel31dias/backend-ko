import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { WebhookDto } from './dto/webhook.dto';
import { TransactionsService } from './transactions.service';
import { Public } from '../auth/public.decorator';

@Controller('transactions')
@Public()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('process')
  async processTransaction(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.processTransaction(dto);
  }

  @Get('user/:userId')
  async getTransactionsByUser(@Param('userId') userId: string) {
    return this.transactionsService.getTransactionsByUser(userId);
  }

  @Post('webhook')
  async processWebhook(@Body() webhookData: WebhookDto) {
    return this.transactionsService.processWebhook(webhookData);
  }
}