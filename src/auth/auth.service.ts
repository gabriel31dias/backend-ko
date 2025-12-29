import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.validateCredentials(email, password);
    
    // Criar payload para o JWT
    const payload = { 
      sub: user.id, 
      email: user.email,
      name: user.name 
    };
    
    // Gerar JWT token
    const accessToken = this.jwtService.sign(payload);
    
    // Garantir que o usuário tem chaves de API
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

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
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

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido');
    }

    if (resetToken.used) {
      throw new BadRequestException('Token já foi utilizado');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Token expirado');
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
}
