import { Controller, Get, Param, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':userId')
  getWallet(@Param('userId') userId: string) {
    return this.walletService.getWalletSummary(userId);
  }

  @Get(':userId/balance')
  getBalance(@Param('userId') userId: string) {
    return this.walletService.getBalance(userId);
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
}
