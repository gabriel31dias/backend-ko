import { PrismaService } from '../prisma/prisma.service';
interface ChartPoint {
    hour: string;
    value: number;
}
export interface NetRevenueResponse {
    title: string;
    value: number;
    changePercent: number;
    chartData: ChartPoint[];
}
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getNetRevenue(userId: string): Promise<NetRevenueResponse>;
}
export {};
//# sourceMappingURL=dashboard.service.d.ts.map