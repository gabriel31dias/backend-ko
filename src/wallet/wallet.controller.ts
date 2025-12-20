import { Controller, Get, Param, Query, Post, Body, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { Public } from '../auth/public.decorator';
import { RequirePermission } from '../api-keys/decorators/require-permission.decorator';
import { ApiKeyPermissionGuard } from '../api-keys/guards/api-key-permission.guard';
import { ApiKeyPermission } from '../api-keys/enums/api-key-permission.enum';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':userId')
  getWallet(@Param('userId') userId: string) {
    return this.walletService.getWalletSummary(userId);
  }

  @Get(':userId/balance')
  getBalance(
    @Param('userId') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.walletService.getBalance(userId, { from, to });
  }

  @Get(':userId/statement')
  getStatement(
    @Param('userId') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    return this.walletService.getStatement(userId, {
      from,
      to,
      limit: limit ? parseInt(limit) : undefined,
      category,
    });
  }

  @Post('withdrawal')
  @Public()
  @UseGuards(ApiKeyPermissionGuard)
  @RequirePermission(ApiKeyPermission.SAQUE)
  async createWithdrawal(@Body() dto: CreateWithdrawalDto) {
    return this.walletService.createWithdrawal(dto);
  }
}
