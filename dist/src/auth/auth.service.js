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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(usersService, jwtService, prisma, emailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async login(email, password) {
        const user = await this.usersService.validateCredentials(email, password);
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name
        };
        const accessToken = this.jwtService.sign(payload);
        const userWithKeys = await this.usersService.ensureApiKeysAndToken(user, accessToken);
        return {
            accessToken,
            user: {
                id: userWithKeys.id,
                name: userWithKeys.name,
                email: userWithKeys.email,
                status: userWithKeys.status,
                wallet: userWithKeys.wallet,
                publicKey: userWithKeys.publicKey,
                secretKey: userWithKeys.secretKey,
            },
        };
    }
    async requestPasswordReset(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        await this.prisma.passwordResetToken.updateMany({
            where: {
                email,
                used: false,
            },
            data: {
                used: true,
            },
        });
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000);
        await this.prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expiresAt,
            },
        });
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000/konnecta-dashboard'}/auth/reset-password?token=${token}`;
        await this.emailService.sendPasswordResetEmail(email, resetLink, user.name);
        return {
            message: 'Link de recuperação enviado para o email',
        };
    }
    async resetPassword(token, newPassword) {
        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { token },
        });
        if (!resetToken) {
            throw new common_1.BadRequestException('Token inválido');
        }
        if (resetToken.used) {
            throw new common_1.BadRequestException('Token já foi utilizado');
        }
        if (resetToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Token expirado');
        }
        await this.usersService.updatePassword(resetToken.email, newPassword);
        await this.prisma.passwordResetToken.update({
            where: { token },
            data: { used: true },
        });
        return {
            message: 'Senha alterada com sucesso',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map