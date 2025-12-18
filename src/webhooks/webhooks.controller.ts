import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createWebhookDto: CreateWebhookDto) {
    const userId = req.user.id;
    return this.webhooksService.create(userId, createWebhookDto);
  }

  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user.id;
    return this.webhooksService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.webhooksService.findOne(id, userId);
  }

  @Put(':id')
  async update(
    @Request() req: any, 
    @Param('id') id: string, 
    @Body() updateWebhookDto: UpdateWebhookDto
  ) {
    const userId = req.user.id;
    return this.webhooksService.update(id, userId, updateWebhookDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    await this.webhooksService.delete(id, userId);
  }

  @Get(':id/deliveries')
  async getDeliveries(
    @Request() req: any,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('eventType') eventType?: string
  ) {
    const userId = req.user.id;
    return this.webhooksService.getDeliveries(id, userId, {
      limit: limit ? parseInt(limit) : undefined,
      eventType,
    });
  }

  @Post(':id/test')
  @HttpCode(HttpStatus.OK)
  async testWebhook(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    const webhook = await this.webhooksService.findOne(id, userId);
    
    // Disparar um evento de teste
    await this.webhooksService.triggerWebhook({
      eventType: 'payment_created',
      data: {
        id: 'test-payment-id',
        amount: 100.00,
        status: 'pending',
        test: true,
      },
      userId,
      timestamp: new Date(),
    });

    return { message: 'Webhook de teste enviado' };
  }
}