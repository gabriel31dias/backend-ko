import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [EmailModule, PrismaModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}