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
export interface PaymentMethodTotal {
    method: string;
    total: number;
    count: number;
    percentage: number;
}
export interface SalesIndexResponse {
    date: string;
    totalSales: number;
    paymentMethods: PaymentMethodTotal[];
}
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSalesIndex(userId: string): Promise<SalesIndexResponse>;
    getNetRevenue(userId: string): Promise<NetRevenueResponse>;
}
export {};
//# sourceMappingURL=dashboard.service.d.ts.map