import { AdminService } from './admin.service';
import { DashboardMetricsQueryDto } from './dto/dashboard-metrics-query.dto';
import { AdminTransactionsQueryDto } from './dto/admin-transactions-query.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboardMetrics(query: DashboardMetricsQueryDto): Promise<import("./admin.service").DashboardMetrics>;
    getAllTransactions(query: AdminTransactionsQueryDto): Promise<import("./admin.service").PaginatedAdminTransactions>;
    getRecentTransactions(): Promise<import("./admin.service").AdminTransaction[]>;
}
//# sourceMappingURL=admin.controller.d.ts.map