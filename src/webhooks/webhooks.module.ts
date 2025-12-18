import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookIntegrationService } from './webhook-integration.service';

@Module({
  imports: [PrismaModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookIntegrationService],
  exports: [WebhooksService, WebhookIntegrationService],
})
export class WebhooksModule {}