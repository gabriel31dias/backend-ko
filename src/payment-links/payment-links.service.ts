import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentLink as PrismaPaymentLink } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { PayLinkDto } from './dto/pay-link.dto';
import { PaymentLink, PaymentResult } from './payment-link.entity';

@Injectable()
export class PaymentLinksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentLinkDto): Promise<PaymentLink> {
    const id = randomUUID();
    const slug = this.toSlug(dto.title, id);
    const expiresAt = this.resolveExpiry(dto.expiresIn);

    const link = await this.prisma.paymentLink.create({
      data: {
        id,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency,
        requireEmail: dto.requireEmail,
        requirePhone: dto.requirePhone,
        allowCustomAmount: dto.allowCustomAmount,
        maxUses: dto.maxUses ?? null,
        expiresAt,
        slug,
        shareUrl: `/pay/${id}`,
        brandColor: dto.brandColor || '#0f172a',
        accentColor: dto.accentColor || '#22c55e',
        backgroundImage: dto.backgroundImage,
      },
    });

    return this.toDomain(link);
  }

  async findAll(): Promise<PaymentLink[]> {
    const links = await this.prisma.paymentLink.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return links.map((link) => this.toDomain(link));
  }

  async findOne(id: string): Promise<PaymentLink> {
    const link = await this.prisma.paymentLink.findUnique({ where: { id } });
    if (!link) {
      throw new NotFoundException('Link não encontrado');
    }
    return this.toDomain(link);
  }

  async registerPayment(id: string, payload: PayLinkDto): Promise<PaymentResult> {
    const link = await this.prisma.paymentLink.findUnique({ where: { id } });
    if (!link) {
      throw new NotFoundException('Link não encontrado');
    }
    if (this.isExpired(link)) {
      await this.prisma.paymentLink.update({ where: { id }, data: { status: 'expired' } });
      throw new BadRequestException('Este link expirou');
    }
    if (link.maxUses && link.uses >= link.maxUses) {
      throw new BadRequestException('Limite de usos atingido');
    }
    if (payload.paymentMethod === 'card') {
      if (!payload.cardNumber || !payload.cardHolder || !payload.cardExpiration || !payload.cardCvv) {
        throw new BadRequestException('Dados do cartão são obrigatórios');
      }
      return this.createCardResult(link);
    }
    return this.createPixResult(link);
  }

  private async createCardResult(link: PrismaPaymentLink): Promise<PaymentResult> {
    const transactionId = randomUUID();
    await this.prisma.$transaction([
      this.prisma.paymentLink.update({
        where: { id: link.id },
        data: { uses: { increment: 1 } },
      }),
      this.prisma.paymentTransaction.create({
        data: {
          paymentMethod: 'card',
          status: 'confirmed',
          transactionId,
          linkId: link.id,
        },
      }),
    ]);

    return {
      paymentMethod: 'card',
      status: 'confirmed',
      transactionId,
      issuedAt: new Date().toISOString(),
    };
  }

  private async createPixResult(link: PrismaPaymentLink): Promise<PaymentResult> {
    const transactionId = randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const pixCode = `0002012648PIX-${link.id}-${Date.now()}`;

    await this.prisma.$transaction([
      this.prisma.paymentLink.update({
        where: { id: link.id },
        data: { uses: { increment: 1 } },
      }),
      this.prisma.paymentTransaction.create({
        data: {
          paymentMethod: 'pix',
          status: 'pending',
          transactionId,
          pixCode,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixCode)}`,
          expiresAt,
          linkId: link.id,
        },
      }),
    ]);

    return {
      paymentMethod: 'pix',
      status: 'pending',
      transactionId,
      issuedAt: new Date().toISOString(),
      pixCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixCode)}`,
      expiresAt: expiresAt.toISOString(),
    };
  }

  private toDomain(model: PrismaPaymentLink): PaymentLink {
    const expired = this.isExpired(model);
    const normalizedStatus: PaymentLink['status'] = expired || model.status === 'expired' ? 'expired' : 'active';
    return {
      id: model.id,
      title: model.title,
      description: model.description ?? undefined,
      amount: model.amount,
      currency: model.currency,
      requireEmail: model.requireEmail,
      requirePhone: model.requirePhone,
      allowCustomAmount: model.allowCustomAmount,
      maxUses: model.maxUses ?? undefined,
      uses: model.uses,
      status: normalizedStatus,
      createdAt: model.createdAt.toISOString(),
      expiresAt: model.expiresAt?.toISOString(),
      slug: model.slug,
      shareUrl: model.shareUrl,
      theme: {
        brandColor: model.brandColor,
        accentColor: model.accentColor,
        backgroundImage: model.backgroundImage ?? undefined,
      },
    };
  }

  private toSlug(title: string, fallback: string) {
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return base ? `${base}-${fallback.slice(0, 6)}` : fallback;
  }

  private isExpired(link: PrismaPaymentLink) {
    return Boolean(link.expiresAt && link.expiresAt.getTime() < Date.now());
  }

  private resolveExpiry(expiresIn?: string) {
    if (!expiresIn || expiresIn === 'never') {
      return undefined;
    }
    const days = Number(expiresIn);
    if (Number.isNaN(days) || days <= 0) {
      return undefined;
    }
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return expires;
  }
}
