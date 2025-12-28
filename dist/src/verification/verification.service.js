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
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
let VerificationService = class VerificationService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async generateAndSendVerificationCode(email, name) {
        const code = this.generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.verificationCode.updateMany({
            where: {
                email: email.toLowerCase(),
                verified: false,
            },
            data: {
                verified: true,
            },
        });
        await this.prisma.verificationCode.create({
            data: {
                email: email.toLowerCase(),
                code,
                expiresAt,
            },
        });
        await this.emailService.sendVerificationCode(email, code, name);
    }
    async verifyCode(email, code) {
        const verificationCode = await this.prisma.verificationCode.findFirst({
            where: {
                email: email.toLowerCase(),
                code,
                verified: false,
                expiresAt: {
                    gte: new Date(),
                },
            },
        });
        if (!verificationCode) {
            throw new common_1.BadRequestException('Código inválido ou expirado');
        }
        await this.prisma.verificationCode.update({
            where: {
                id: verificationCode.id,
            },
            data: {
                verified: true,
            },
        });
        return true;
    }
    async cleanupExpiredCodes() {
        await this.prisma.verificationCode.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], VerificationService);
//# sourceMappingURL=verification.service.js.map