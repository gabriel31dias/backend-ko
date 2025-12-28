import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
export declare class VerificationService {
    private readonly prisma;
    private readonly emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    generateAndSendVerificationCode(email: string, name?: string): Promise<void>;
    verifyCode(email: string, code: string): Promise<boolean>;
    cleanupExpiredCodes(): Promise<void>;
    private generateCode;
}
//# sourceMappingURL=verification.service.d.ts.map