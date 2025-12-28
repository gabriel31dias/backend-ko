import { Injectable, OnModuleInit } from '@nestjs/common';
import { ObjectivesService } from './objectives.service';

@Injectable()
export class ObjectivesSeedService implements OnModuleInit {
  constructor(private readonly objectivesService: ObjectivesService) {}

  async onModuleInit() {
    await this.objectivesService.seedLevels();
  }
}