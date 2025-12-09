import { UsersService } from '../users/users.service';
import { WalletMovementService } from './wallet-movement.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class WalletService {
    private readonly usersService;
    private readonly walletMovementService;
    private readonly prisma;
    constructor(usersService: UsersService, walletMovementService: WalletMovementService, prisma: PrismaService);
    getWalletSummary(userId: string): Promise<{
        userId: string;
        currency: string;
        saldoAtual: number;
        grossBalance: number;
        valorReceber: number;
        averageTicketSold: number;
        refundFee: number;
    }>;
    getStatement(userId: string, options?: {
        from?: string;
        to?: string;
        limit?: number;
        category?: string;
    }): Promise<import("./entities/wallet-movement.entity").WalletStatement>;
    getBalance(userId: string): Promise<{
        userId: string;
        balance: number;
        grossBalance: number;
        currency: string;
        averageTicketSold: number;
        refundFee: number;
    }>;
    private calculateAverageTicket;
}
//# sourceMappingURL=wallet.service.d.ts.map