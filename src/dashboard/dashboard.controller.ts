import { Controller, Get } from '@nestjs/common';
import { DashboardService, NetRevenueResponse } from './dashboard.service';
import { CurrentUser } from '../auth/user.decorator';
import { User } from '../users/user.entity';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('net-revenue')
  getNetRevenue(@CurrentUser() user: User): Promise<NetRevenueResponse> {
    return this.dashboardService.getNetRevenue(user.id);
  }
}
