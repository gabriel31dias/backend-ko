import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly prisma;
    private readonly emailService;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService, emailService: EmailService);
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            status: string;
            wallet: import("../users/user.entity").WalletSnapshot;
            publicKey: string;
            secretKey: string;
        };
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map