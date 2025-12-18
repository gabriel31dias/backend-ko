import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(payload: LoginDto): Promise<{
        accessToken: `${string}-${string}-${string}-${string}-${string}`;
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
}
//# sourceMappingURL=auth.controller.d.ts.map