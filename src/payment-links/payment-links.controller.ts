import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { PayLinkDto } from './dto/pay-link.dto';
import { PaymentLinksService } from './payment-links.service';
import { Public } from '../auth/public.decorator';

@Controller('payment-links')
export class PaymentLinksController {
  constructor(private readonly service: PaymentLinksService) {}

  @Post()
  create(@Body() dto: CreatePaymentLinkDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/pay')
  @Public()
  pay(@Param('id') id: string, @Body() dto: PayLinkDto) {
    return this.service.registerPayment(id, dto);
  }
}
