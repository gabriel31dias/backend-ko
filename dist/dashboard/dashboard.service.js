"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getNetRevenue(userId) {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(endOfToday.getDate() + 1);
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const todayTransactions = await this.prisma.transaction.findMany({
            where: {
                receiverUserId: userId,
                status: 'approved',
                approvedAt: {
                    gte: startOfToday,
                    lt: endOfToday,
                },
                netAmount: {
                    not: null,
                },
            },
            select: {
                netAmount: true,
                approvedAt: true,
            },
        });
        const yesterdayTotal = await this.prisma.transaction.aggregate({
            where: {
                receiverUserId: userId,
                status: 'approved',
                approvedAt: {
                    gte: startOfYesterday,
                    lt: startOfToday,
                },
                netAmount: { not: null },
            },
            _sum: { netAmount: true },
        });
        const hourlyMap = Array.from({ length: 24 }, (_, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}h`,
            value: 0,
        }));
        let totalToday = 0;
        for (const tx of todayTransactions) {
            if (!tx.netAmount || !tx.approvedAt) {
                continue;
            }
            const hour = tx.approvedAt.getHours();
            hourlyMap[hour].value += tx.netAmount;
            totalToday += tx.netAmount;
        }
        const yesterdayValue = yesterdayTotal._sum.netAmount || 0;
        const changePercent = yesterdayValue > 0
            ? ((totalToday - yesterdayValue) / yesterdayValue) * 100
            : totalToday > 0 ? 100 : 0;
        return {
            title: 'Receita Líquida',
            value: Number(totalToday.toFixed(2)),
            changePercent: Math.round(changePercent),
            chartData: hourlyMap.map(point => ({
                hour: point.hour,
                value: Number(point.value.toFixed(2)),
            })),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map