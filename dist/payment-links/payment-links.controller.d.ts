import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { PayLinkDto } from './dto/pay-link.dto';
import { PaymentLinksService } from './payment-links.service';
export declare class PaymentLinksController {
    private readonly service;
    constructor(service: PaymentLinksService);
    create(dto: CreatePaymentLinkDto): Promise<import("./payment-link.entity").PaymentLink>;
    findAll(): Promise<import("./payment-link.entity").PaymentLink[]>;
    findOne(id: string): Promise<import("./payment-link.entity").PaymentLink>;
    pay(id: string, dto: PayLinkDto): Promise<import("./payment-link.entity").PaymentResult>;
}
//# sourceMappingURL=payment-links.controller.d.ts.map