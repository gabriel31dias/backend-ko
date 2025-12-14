import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly usersService;
    constructor(usersService: UsersService);
    login(email: string, password: string): Promise<{
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
//# sourceMappingURL=auth.service.d.ts.map