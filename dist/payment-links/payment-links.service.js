"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentLinksService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentLinksService = class PaymentLinksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        var _a;
        const id = (0, crypto_1.randomUUID)();
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
                maxUses: (_a = dto.maxUses) !== null && _a !== void 0 ? _a : null,
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
    async findAll() {
        const links = await this.prisma.paymentLink.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return links.map((link) => this.toDomain(link));
    }
    async findOne(id) {
        const link = await this.prisma.paymentLink.findUnique({ where: { id } });
        if (!link) {
            throw new common_1.NotFoundException('Link não encontrado');
        }
        return this.toDomain(link);
    }
    async registerPayment(id, payload) {
        const link = await this.prisma.paymentLink.findUnique({ where: { id } });
        if (!link) {
            throw new common_1.NotFoundException('Link não encontrado');
        }
        if (this.isExpired(link)) {
            await this.prisma.paymentLink.update({ where: { id }, data: { status: 'expired' } });
            throw new common_1.BadRequestException('Este link expirou');
        }
        if (link.maxUses && link.uses >= link.maxUses) {
            throw new common_1.BadRequestException('Limite de usos atingido');
        }
        if (payload.paymentMethod === 'card') {
            if (!payload.cardNumber || !payload.cardHolder || !payload.cardExpiration || !payload.cardCvv) {
                throw new common_1.BadRequestException('Dados do cartão são obrigatórios');
            }
            return this.createCardResult(link);
        }
        return this.createPixResult(link);
    }
    async createCardResult(link) {
        const transactionId = (0, crypto_1.randomUUID)();
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
    async createPixResult(link) {
        const transactionId = (0, crypto_1.randomUUID)();
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
    toDomain(model) {
        var _a, _b, _c, _d;
        const expired = this.isExpired(model);
        const normalizedStatus = expired || model.status === 'expired' ? 'expired' : 'active';
        return {
            id: model.id,
            title: model.title,
            description: (_a = model.description) !== null && _a !== void 0 ? _a : undefined,
            amount: model.amount,
            currency: model.currency,
            requireEmail: model.requireEmail,
            requirePhone: model.requirePhone,
            allowCustomAmount: model.allowCustomAmount,
            maxUses: (_b = model.maxUses) !== null && _b !== void 0 ? _b : undefined,
            uses: model.uses,
            status: normalizedStatus,
            createdAt: model.createdAt.toISOString(),
            expiresAt: (_c = model.expiresAt) === null || _c === void 0 ? void 0 : _c.toISOString(),
            slug: model.slug,
            shareUrl: model.shareUrl,
            theme: {
                brandColor: model.brandColor,
                accentColor: model.accentColor,
                backgroundImage: (_d = model.backgroundImage) !== null && _d !== void 0 ? _d : undefined,
            },
        };
    }
    toSlug(title, fallback) {
        const base = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return base ? `${base}-${fallback.slice(0, 6)}` : fallback;
    }
    isExpired(link) {
        return Boolean(link.expiresAt && link.expiresAt.getTime() < Date.now());
    }
    resolveExpiry(expiresIn) {
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
};
exports.PaymentLinksService = PaymentLinksService;
exports.PaymentLinksService = PaymentLinksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentLinksService);
//# sourceMappingURL=payment-links.service.js.map