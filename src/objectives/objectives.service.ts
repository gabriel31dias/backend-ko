import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ObjectivesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserObjectives(userId: string) {
    const [totalRevenue, levels] = await Promise.all([
      this.calculateTotalRevenue(userId),
      this.getUserLevels(),
    ]);

    const currentLevel = this.getCurrentLevel(totalRevenue, levels);
    const nextLevel = this.getNextLevel(currentLevel, levels);

    return {
      totalRevenue,
      currentLevel: currentLevel ? {
        id: currentLevel.id,
        name: currentLevel.name,
        targetAmount: currentLevel.targetAmount,
        description: currentLevel.description,
      } : null,
      nextLevel: nextLevel ? {
        id: nextLevel.id,
        name: nextLevel.name,
        targetAmount: nextLevel.targetAmount,
        description: nextLevel.description,
        remaining: nextLevel.targetAmount - totalRevenue,
      } : null,
      progress: nextLevel ? (totalRevenue / nextLevel.targetAmount) * 100 : 100,
    };
  }

  private async calculateTotalRevenue(userId: string): Promise<number> {
    const aggregate = await this.prisma.transaction.aggregate({
      where: {
        receiverUserId: userId,
        status: 'approved',
      },
      _sum: { amount: true },
    });

    return aggregate._sum.amount || 0;
  }

  private async getUserLevels() {
    return this.prisma.userLevel.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  private getCurrentLevel(totalRevenue: number, levels: any[]) {
    let currentLevel = null;
    
    for (const level of levels) {
      if (totalRevenue >= level.targetAmount) {
        currentLevel = level;
      } else {
        break;
      }
    }
    
    return currentLevel;
  }

  private getNextLevel(currentLevel: any, levels: any[]) {
    if (!currentLevel) {
      return levels[0] || null;
    }
    
    const currentIndex = levels.findIndex(level => level.id === currentLevel.id);
    return levels[currentIndex + 1] || null;
  }

  async createLevel(name: string, targetAmount: number, description?: string, order?: number) {
    const maxOrder = await this.prisma.userLevel.aggregate({
      _max: { order: true },
    });

    return this.prisma.userLevel.create({
      data: {
        name,
        targetAmount,
        description,
        order: order || (maxOrder._max.order || 0) + 1,
      },
    });
  }

  async seedLevels() {
    const existingLevels = await this.prisma.userLevel.count();
    
    if (existingLevels === 0) {
      await Promise.all([
        this.createLevel('Nível Bronze', 100000, 'Primeiro marco de faturamento', 1),
        this.createLevel('Nível Prata', 200000, 'Segundo marco de faturamento', 2),
      ]);
    }
  }
}