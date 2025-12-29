import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(payload: LoginDto): Promise<{
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
    forgotPassword(payload: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(payload: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map