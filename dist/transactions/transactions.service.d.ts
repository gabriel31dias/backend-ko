import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { WalletMovementService } from '../wallet/wallet-movement.service';
import { SettingsService } from '../settings/settings.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { Transaction, TransactionResponse } from './entities/transaction.entity';
export interface PaginatedTransactions {
    transactions: Transaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare class TransactionsService {
    private readonly prisma;
    private readonly usersService;
    private readonly walletMovementService;
    private readonly settingsService;
    constructor(prisma: PrismaService, usersService: UsersService, walletMovementService: WalletMovementService, settingsService: SettingsService);
    processTransaction(dto: CreateTransactionDto): Promise<TransactionResponse>;
    private validateApiCredentials;
    private mockAdquirenteProcess;
    private mockPixResponse;
    private mockCardResponse;
    private generateMockPixCode;
    private createTransaction;
    private updateUserWallet;
    private calculateFees;
    processWebhook(webhookData: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getTransactionsPaginated(userId: string, query: PaginationQueryDto): Promise<PaginatedTransactions>;
    getTransactionsByUser(userId: string): Promise<Transaction[]>;
}
//# sourceMappingURL=transactions.service.d.ts.map