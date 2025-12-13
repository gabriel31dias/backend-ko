import { Controller, Get } from '@nestjs/common';
import { DashboardService, NetRevenueResponse, SalesIndexResponse } from './dashboard.service';
import { CurrentUser } from '../auth/user.decorator';
import { User } from '../users/user.entity';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getIndex(@CurrentUser() user: User): Promise<SalesIndexResponse> {
    return this.dashboardService.getSalesIndex(user.id);
  }

  @Get('net-revenue')
  getNetRevenue(@CurrentUser() user: User): Promise<NetRevenueResponse> {
    return this.dashboardService.getNetRevenue(user.id);
  }
}
