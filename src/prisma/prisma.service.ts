import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Carregar variáveis de ambiente antes de instanciar o PrismaClient
if (typeof process.loadEnvFile === 'function') {
  process.loadEnvFile();
}

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
