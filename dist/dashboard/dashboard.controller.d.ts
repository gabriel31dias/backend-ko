import { DashboardService, NetRevenueResponse } from './dashboard.service';
import { User } from '../users/user.entity';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getNetRevenue(user: User): Promise<NetRevenueResponse>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map