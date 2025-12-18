import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardMetricsQueryDto } from './dto/dashboard-metrics-query.dto';
import { AdminTransactionsQueryDto } from './dto/admin-transactions-query.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/metrics')
  async getDashboardMetrics(@Query() query: DashboardMetricsQueryDto) {
    return this.adminService.getDashboardMetrics(query);
  }

  @Get('transactions')
  async getAllTransactions(@Query() query: AdminTransactionsQueryDto) {
    return this.adminService.getAllTransactions(query);
  }

  @Get('transactions/recent')
  async getRecentTransactions() {
    return this.adminService.getRecentTransactions();
  }
}