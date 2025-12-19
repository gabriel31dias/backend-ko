import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
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
}
//# sourceMappingURL=auth.service.d.ts.map