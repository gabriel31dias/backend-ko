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
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
    
    console.log(`Generating verification code for ${email.toLowerCase()}: code=${code}, expires=${expiresAt.toISOString()}, timestamp=${now.toISOString()}`);

    // Usar transação para garantir atomicidade
    await this.prisma.$transaction(async (prisma) => {
      // Invalidar códigos anteriores para este email
      await prisma.verificationCode.updateMany({
        where: {
          email: email.toLowerCase(),
          verified: false,
        },
        data: {
          verified: true, // Marca como verificado para invalidar
        },
      });

      // Criar novo código
      await prisma.verificationCode.create({
        data: {
          email: email.toLowerCase(),
          code,
          expiresAt,
        },
      });
    });

    // Enviar email
    try {
      await this.emailService.sendVerificationCode(email, code, name);
      console.log(`Verification email sent successfully to ${email}`);
    } catch (error) {
      console.error(`Failed to send verification email to ${email}:`, error);
      throw error;
    }
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    const now = new Date();
    
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        email: email.toLowerCase(),
        code,
        verified: false,
        expiresAt: {
          gte: now,
        },
      },
    });

    if (!verificationCode) {
      // Log para debug em produção
      console.log(`Verification failed for email: ${email.toLowerCase()}, code: ${code}, timestamp: ${now.toISOString()}`);
      
      // Verificar se existe código para este email
      const existingCode = await this.prisma.verificationCode.findFirst({
        where: {
          email: email.toLowerCase(),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      if (existingCode) {
        console.log(`Last code for ${email}: code=${existingCode.code}, expires=${existingCode.expiresAt.toISOString()}, verified=${existingCode.verified}, created=${existingCode.createdAt.toISOString()}`);
      }
      
      throw new BadRequestException('Código inválido ou expirado');
    }

    // Marcar como verificado usando transação para evitar race conditions
    await this.prisma.verificationCode.update({
      where: {
        id: verificationCode.id,
        verified: false, // Garantir que ainda não foi verificado
      },
      data: {
        verified: true,
      },
    });

    return true;
  }

  async cleanupExpiredCodes(): Promise<void> {
    const deleted = await this.prisma.verificationCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    
    console.log(`Cleaned up ${deleted.count} expired verification codes`);
  }

  async getVerificationStatus(email: string): Promise<{
    hasValidCode: boolean;
    lastCodeInfo?: {
      code: string;
      expiresAt: Date;
      verified: boolean;
      createdAt: Date;
    };
  }> {
    const lastCode = await this.prisma.verificationCode.findFirst({
      where: {
        email: email.toLowerCase(),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!lastCode) {
      return { hasValidCode: false };
    }

    const now = new Date();
    const hasValidCode = !lastCode.verified && lastCode.expiresAt > now;

    return {
      hasValidCode,
      lastCodeInfo: {
        code: lastCode.code,
        expiresAt: lastCode.expiresAt,
        verified: lastCode.verified,
        createdAt: lastCode.createdAt,
      },
    };
  }

  private generateCode(): string {
    // Gera um código de 6 dígitos
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}