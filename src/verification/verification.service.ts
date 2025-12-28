import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async generateAndSendVerificationCode(email: string, name?: string): Promise<void> {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidar códigos anteriores para este email
    await this.prisma.verificationCode.updateMany({
      where: {
        email: email.toLowerCase(),
        verified: false,
      },
      data: {
        verified: true, // Marca como verificado para invalidar
      },
    });

    // Criar novo código
    await this.prisma.verificationCode.create({
      data: {
        email: email.toLowerCase(),
        code,
        expiresAt,
      },
    });

    // Enviar email
    await this.emailService.sendVerificationCode(email, code, name);
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
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
      throw new BadRequestException('Código inválido ou expirado');
    }

    // Marcar como verificado
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

  async cleanupExpiredCodes(): Promise<void> {
    await this.prisma.verificationCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  private generateCode(): string {
    // Gera um código de 6 dígitos
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}