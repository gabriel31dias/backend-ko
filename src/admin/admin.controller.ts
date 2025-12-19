import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardMetricsQueryDto } from './dto/dashboard-metrics-query.dto';
import { AdminTransactionsQueryDto } from './dto/admin-transactions-query.dto';
import { RejectDocumentsDto } from './dto/reject-documents.dto';
import { DocumentsQueryDto } from './dto/documents-query.dto';

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

  @Get('documents')
  async getAllDocuments(@Query() query: DocumentsQueryDto) {
    return this.adminService.getAllDocuments(query);
  }

  @Post('documents/reject')
  async rejectUserDocuments(@Body() rejectDocumentsDto: RejectDocumentsDto) {
    return this.adminService.rejectUserDocuments(rejectDocumentsDto.users);
  }
}