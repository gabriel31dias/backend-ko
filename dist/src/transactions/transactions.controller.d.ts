import { CreateTransactionDto } from './dto/create-transaction.dto';
import { WebhookDto } from './dto/webhook.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { TransactionsService, PaginatedTransactions } from './transactions.service';
import { User } from '../users/user.entity';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    getMyTransactions(user: User, query: PaginationQueryDto): Promise<PaginatedTransactions>;
    processTransaction(dto: CreateTransactionDto): Promise<import("./entities/transaction.entity").TransactionResponse>;
    getTransactionsByUser(userId: string): Promise<import("./entities/transaction.entity").Transaction[]>;
    processWebhook(webhookData: WebhookDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=transactions.controller.d.ts.map