import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { PaymentLinksModule } from './payment-links/payment-links.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SettingsModule } from './settings/settings.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { PrismaModule } from './prisma/prisma.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { AdminModule } from './admin/admin.module';
import { ObjectivesModule } from './objectives/objectives.module';
import { EmailModule } from './email/email.module';
import { VerificationModule } from './verification/verification.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, WalletModule, PaymentLinksModule, TransactionsModule, SettingsModule, WebhooksModule, DashboardModule, ApiKeysModule, AdminModule, ObjectivesModule, EmailModule, VerificationModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
