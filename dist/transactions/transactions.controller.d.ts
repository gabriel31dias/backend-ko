import { CreateTransactionDto } from './dto/create-transaction.dto';
import { WebhookDto } from './dto/webhook.dto';
import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    processTransaction(dto: CreateTransactionDto): Promise<import("./entities/transaction.entity").TransactionResponse>;
    getTransactionsByUser(userId: string): Promise<import("./entities/transaction.entity").Transaction[]>;
    processWebhook(webhookData: WebhookDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=transactions.controller.d.ts.map