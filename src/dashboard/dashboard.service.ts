import { Injectable } from '@nestjs/common';
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

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getNetRevenue(userId: string): Promise<NetRevenueResponse> {
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
}
