import { UsersService } from '../users/users.service';
import { WalletMovementService } from './wallet-movement.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ApiKeysService } from '../api-keys/api-keys.service';
export declare class WalletService {
    private readonly usersService;
    private readonly walletMovementService;
    private readonly prisma;
    private readonly apiKeysService;
    constructor(usersService: UsersService, walletMovementService: WalletMovementService, prisma: PrismaService, apiKeysService: ApiKeysService);
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
    getBalance(userId: string, options?: {
        from?: string;
        to?: string;
    }): Promise<{
        userId: string;
        balance: number;
        grossBalance: number;
        currency: string;
        averageTicketSold: number;
        refundFee: number;
        from: Date;
        to: Date;
        totalCredits: number;
        totalDebits: number;
        netMovement: number;
        salesCount: number;
    }>;
    private calculateAverageTicket;
    createWithdrawal(dto: CreateWithdrawalDto): Promise<{
        id: string;
        amount: number;
        method: string;
        status: string;
        description: string;
        createdAt: Date;
    }>;
    private parseDate;
}
//# sourceMappingURL=wallet.service.d.ts.map