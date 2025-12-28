import { Module } from '@nestjs/common';
import { ObjectivesController } from './objectives.controller';
import { ObjectivesService } from './objectives.service';
import { ObjectivesSeedService } from './objectives-seed.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [ObjectivesController],
  providers: [ObjectivesService, ObjectivesSeedService],
  exports: [ObjectivesService],
})
export class ObjectivesModule {}