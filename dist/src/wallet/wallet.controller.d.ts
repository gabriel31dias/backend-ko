import { WalletService } from './wallet.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getWallet(userId: string): Promise<{
        userId: string;
        currency: string;
        saldoAtual: number;
        grossBalance: number;
        valorReceber: number;
        averageTicketSold: number;
        refundFee: number;
    }>;
    getBalance(userId: string, from?: string, to?: string): Promise<{
        userId: string;
        balance: number;
        grossBalance: number;
        currency: string;
        averageTicketSold: number;
        refundFee: number;
        period: {
            from: Date;
            to: Date;
            totalCredits: number;
            totalDebits: number;
            netMovement: number;
            salesCount: number;
        };
    }>;
    getStatement(userId: string, from?: string, to?: string, limit?: string, category?: string): Promise<import("./entities/wallet-movement.entity").WalletStatement>;
    createWithdrawal(dto: CreateWithdrawalDto): Promise<{
        id: string;
        amount: number;
        method: string;
        status: string;
        description: string;
        createdAt: Date;
    }>;
}
//# sourceMappingURL=wallet.controller.d.ts.map