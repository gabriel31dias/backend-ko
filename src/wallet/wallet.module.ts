import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletMovementService } from './wallet-movement.service';

@Module({
  imports: [UsersModule, PrismaModule, SettingsModule, ApiKeysModule],
  controllers: [WalletController],
  providers: [WalletService, WalletMovementService],
  exports: [WalletService, WalletMovementService],
})
export class WalletModule {}
