import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('objectives')
@UseGuards(JwtAuthGuard)
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

  @Get('me')
  async getMyObjectives(@Request() req) {
    return this.objectivesService.getUserObjectives(req.user.sub);
  }
}