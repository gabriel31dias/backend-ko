import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(query: DashboardMetricsQueryDto): Promise<DashboardMetrics> {
    const { startDate, endDate } = this.calculateDateRange(query);

    const whereCondition = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: 'approved',
    };

    const [
      transactionsWithoutDiscount,
      transactionsWithDiscount,
      totalCount,
      cardTransactions,
      pixTransactions
    ] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          ...whereCondition,
          OR: [
            { totalFeesApplied: null },
            { totalFeesApplied: 0 }
          ]
        },
        _sum: { amount: true }
      }),
      
      this.prisma.transaction.aggregate({
        where: {
          ...whereCondition,
          totalFeesApplied: { gt: 0 }
        },
        _sum: { amount: true }
      }),

      this.prisma.transaction.count({
        where: whereCondition
      }),

      this.prisma.transaction.aggregate({
        where: {
          ...whereCondition,
          paymentMethod: 'card'
        },
        _sum: { amount: true }
      }),

      this.prisma.transaction.aggregate({
        where: {
          ...whereCondition,
          paymentMethod: 'pix'
        },
        _sum: { amount: true }
      })
    ]);

    return {
      totalTransactionsWithoutDiscount: transactionsWithoutDiscount._sum.amount || 0,
      totalTransactionsWithDiscount: transactionsWithDiscount._sum.amount || 0,
      totalTransactionsCount: totalCount,
      totalByPaymentMethod: {
        card: cardTransactions._sum.amount || 0,
        pix: pixTransactions._sum.amount || 0
      },
      period: {
        start: startDate,
        end: endDate
      }
    };
  }

  async getAllTransactions(query: AdminTransactionsQueryDto): Promise<PaginatedAdminTransactions> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    if (query.customerName) {
      where.customerName = {
        contains: query.customerName,
        mode: 'insensitive',
      };
    }

    if (query.userId) {
      where.receiverUserId = query.userId;
    }

    if (query.transactionId) {
      where.transactionId = {
        contains: query.transactionId,
        mode: 'insensitive',
      };
    }

    if (query.search) {
      where.OR = [
        {
          customerName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          customerEmail: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          customerTaxId: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          transactionId: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        const startDate = query.startDate.includes('T') ? 
          new Date(query.startDate) : 
          new Date(query.startDate + 'T00:00:00');
        where.createdAt.gte = startDate;
      }
      if (query.endDate) {
        const endDate = query.endDate.includes('T') ? 
          new Date(query.endDate) : 
          new Date(query.endDate + 'T23:59:59');
        where.createdAt.lte = endDate;
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          receiver: {
            select: {
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        paymentMethod: t.paymentMethod as 'pix' | 'card',
        status: t.status as 'pending' | 'waiting' | 'approved' | 'rejected',
        transactionId: t.transactionId,
        description: t.description,
        customerName: t.customerName,
        customerEmail: t.customerEmail,
        customerPhone: t.customerPhone,
        customerDocument: t.customerDocument,
        customerType: t.customerType as 'pf' | 'pj',
        customerTaxId: t.customerTaxId,
        receiverUserId: t.receiverUserId,
        receiverUserName: t.receiver.name,
        receiverUserEmail: t.receiver.email,
        createdAt: t.createdAt,
        approvedAt: t.approvedAt,
        grossAmount: t.grossAmount,
        fixedFeeApplied: t.fixedFeeApplied,
        percentageFeeApplied: t.percentageFeeApplied,
        totalFeesApplied: t.totalFeesApplied,
        netAmount: t.netAmount,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  private calculateDateRange(query: DashboardMetricsQueryDto): { startDate: Date; endDate: Date } {
    let startDate: Date;
    let endDate: Date;

    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate + 'T00:00:00');
      endDate = new Date(query.endDate + 'T23:59:59');
      
      const maxStartDate = new Date();
      maxStartDate.setMonth(maxStartDate.getMonth() - 3);
      
      if (startDate < maxStartDate) {
        startDate = maxStartDate;
      }
    } else {
      const today = new Date();
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    }

    return { startDate, endDate };
  }

  async getRecentTransactions(): Promise<AdminTransaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      include: {
        receiver: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return transactions.map(t => ({
      id: t.id,
      amount: t.amount,
      paymentMethod: t.paymentMethod as 'pix' | 'card',
      status: t.status as 'pending' | 'waiting' | 'approved' | 'rejected',
      transactionId: t.transactionId,
      description: t.description,
      customerName: t.customerName,
      customerEmail: t.customerEmail,
      customerPhone: t.customerPhone,
      customerDocument: t.customerDocument,
      customerType: t.customerType as 'pf' | 'pj',
      customerTaxId: t.customerTaxId,
      receiverUserId: t.receiverUserId,
      receiverUserName: t.receiver.name,
      receiverUserEmail: t.receiver.email,
      createdAt: t.createdAt,
      approvedAt: t.approvedAt,
      grossAmount: t.grossAmount,
      fixedFeeApplied: t.fixedFeeApplied,
      percentageFeeApplied: t.percentageFeeApplied,
      totalFeesApplied: t.totalFeesApplied,
      netAmount: t.netAmount,
    }));
  }
}