import { DashboardService, NetRevenueResponse, SalesIndexResponse } from './dashboard.service';
import { User } from '../users/user.entity';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getIndex(user: User): Promise<SalesIndexResponse>;
    getNetRevenue(user: User): Promise<NetRevenueResponse>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map