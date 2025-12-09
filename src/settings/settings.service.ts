import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalSetting, GlobalFeeSettings } from './entities/global-settings.entity';
import { UpdateGlobalFeesDto } from './dto/update-global-fees.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalFees(): Promise<GlobalFeeSettings> {
    // Buscar configurações existentes
    const settings = await this.prisma.globalSettings.findMany({
      where: {
        key: {
          in: ['global_fixed_fee', 'global_percentage_fee'],
        },
      },
    });

    // Valores padrão
    let fixedFee = 1.00; // R$ 1,00 padrão
    let percentageFee = 3.00; // 3% padrão

    // Aplicar valores salvos se existirem
    for (const setting of settings) {
      if (setting.key === 'global_fixed_fee') {
        fixedFee = parseFloat(setting.value);
      } else if (setting.key === 'global_percentage_fee') {
        percentageFee = parseFloat(setting.value);
      }
    }

    return { fixedFee, percentageFee };
  }

  async updateGlobalFees(dto: UpdateGlobalFeesDto): Promise<GlobalFeeSettings> {
    // Atualizar ou criar taxa fixa
    await this.prisma.globalSettings.upsert({
      where: { key: 'global_fixed_fee' },
      create: {
        key: 'global_fixed_fee',
        value: dto.fixedFee.toString(),
        description: 'Taxa fixa global para transações',
      },
      update: {
        value: dto.fixedFee.toString(),
        updatedAt: new Date(),
      },
    });

    // Atualizar ou criar taxa percentual
    await this.prisma.globalSettings.upsert({
      where: { key: 'global_percentage_fee' },
      create: {
        key: 'global_percentage_fee',
        value: dto.percentageFee.toString(),
        description: 'Taxa percentual global para transações',
      },
      update: {
        value: dto.percentageFee.toString(),
        updatedAt: new Date(),
      },
    });

    return { fixedFee: dto.fixedFee, percentageFee: dto.percentageFee };
  }

  async getUserEffectiveFees(userId: string): Promise<GlobalFeeSettings> {
    // Buscar configurações do usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fixedFee: true, percentageFee: true },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Buscar configurações globais
    const globalFees = await this.getGlobalFees();

    // Priorizar configurações do usuário sobre globais
    const effectiveFees = {
      fixedFee: user.fixedFee !== null ? user.fixedFee : globalFees.fixedFee,
      percentageFee: user.percentageFee !== null ? user.percentageFee : globalFees.percentageFee,
    };

    return effectiveFees;
  }

  private toDomain(setting: any): GlobalSetting {
    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      description: setting.description,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }
}