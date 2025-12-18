import { PrismaService } from '../prisma/prisma.service';
import { DashboardMetricsQueryDto } from './dto/dashboard-metrics-query.dto';
import { AdminTransactionsQueryDto } from './dto/admin-transactions-query.dto';
export interface DashboardMetrics {
    totalTransactionsWithoutDiscount: number;
    totalTransactionsWithDiscount: number;
    totalTransactionsCount: number;
    totalByPaymentMethod: {
        card: number;
        pix: number;
    };
    period: {
        start: Date;
        end: Date;
    };
}
export interface AdminTransaction {
    id: string;
    amount: number;
    paymentMethod: 'pix' | 'card';
    status: 'pending' | 'waiting' | 'approved' | 'rejected';
    transactionId: string;
    description: string | null;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    customerDocument: string | null;
    customerType: 'pf' | 'pj';
    customerTaxId: string;
    receiverUserId: string;
    receiverUserName: string;
    receiverUserEmail: string;
    createdAt: Date;
    approvedAt: Date | null;
    grossAmount: number | null;
    fixedFeeApplied: number | null;
    percentageFeeApplied: number | null;
    totalFeesApplied: number | null;
    netAmount: number | null;
}
export interface PaginatedAdminTransactions {
    transactions: AdminTransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardMetrics(query: DashboardMetricsQueryDto): Promise<DashboardMetrics>;
    getAllTransactions(query: AdminTransactionsQueryDto): Promise<PaginatedAdminTransactions>;
    private calculateDateRange;
    getRecentTransactions(): Promise<AdminTransaction[]>;
}
//# sourceMappingURL=admin.service.d.ts.map