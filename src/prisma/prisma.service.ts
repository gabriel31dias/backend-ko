import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    if (this.$connect) {
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    if (this.$disconnect) {
      await this.$disconnect();
    }
  }
}
