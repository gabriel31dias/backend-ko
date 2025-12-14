import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { WebhookDto } from './dto/webhook.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { TransactionsService, PaginatedTransactions } from './transactions.service';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/user.decorator';
import { User } from '../users/user.entity';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getMyTransactions(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto
  ): Promise<PaginatedTransactions> {
    return this.transactionsService.getTransactionsPaginated(user.id, query);
  }

  @Post('process')
  @Public()
  async processTransaction(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.processTransaction(dto);
  }

  @Get('user/:userId')
  @Public()
  async getTransactionsByUser(@Param('userId') userId: string) {
    return this.transactionsService.getTransactionsByUser(userId);
  }

  @Post('webhook')
  @Public()
  async processWebhook(@Body() webhookData: WebhookDto) {
    return this.transactionsService.processWebhook(webhookData);
  }
}