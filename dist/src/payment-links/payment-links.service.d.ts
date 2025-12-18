import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { PayLinkDto } from './dto/pay-link.dto';
import { PaymentLink, PaymentResult } from './payment-link.entity';
export declare class PaymentLinksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreatePaymentLinkDto): Promise<PaymentLink>;
    findAll(): Promise<PaymentLink[]>;
    findOne(id: string): Promise<PaymentLink>;
    registerPayment(id: string, payload: PayLinkDto): Promise<PaymentResult>;
    private createCardResult;
    private createPixResult;
    private toDomain;
    private toSlug;
    private isExpired;
    private resolveExpiry;
}
//# sourceMappingURL=payment-links.service.d.ts.map