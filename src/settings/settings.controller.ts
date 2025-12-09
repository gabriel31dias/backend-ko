import { Body, Controller, Get, Put } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateGlobalFeesDto } from './dto/update-global-fees.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('global-fees')
  async getGlobalFees() {
    return this.settingsService.getGlobalFees();
  }

  @Put('global-fees')
  async updateGlobalFees(@Body() dto: UpdateGlobalFeesDto) {
    return this.settingsService.updateGlobalFees(dto);
  }
}