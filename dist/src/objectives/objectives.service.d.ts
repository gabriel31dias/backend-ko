import { PrismaService } from '../prisma/prisma.service';
export declare class ObjectivesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserObjectives(userId: string): Promise<{
        totalRevenue: number;
        currentLevel: {
            id: any;
            name: any;
            targetAmount: any;
            description: any;
        };
        nextLevel: {
            id: any;
            name: any;
            targetAmount: any;
            description: any;
            remaining: number;
        };
        progress: number;
    }>;
    private calculateTotalRevenue;
    private getUserLevels;
    private getCurrentLevel;
    private getNextLevel;
    createLevel(name: string, targetAmount: number, description?: string, order?: number): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        targetAmount: number;
        description: string | null;
        isActive: boolean;
        order: number;
    }>;
    seedLevels(): Promise<void>;
}
//# sourceMappingURL=objectives.service.d.ts.map