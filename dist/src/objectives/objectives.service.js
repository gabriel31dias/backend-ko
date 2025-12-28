"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectivesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ObjectivesService = class ObjectivesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserObjectives(userId) {
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
    async calculateTotalRevenue(userId) {
        const aggregate = await this.prisma.transaction.aggregate({
            where: {
                receiverUserId: userId,
                status: 'approved',
            },
            _sum: { amount: true },
        });
        return aggregate._sum.amount || 0;
    }
    async getUserLevels() {
        return this.prisma.userLevel.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
    }
    getCurrentLevel(totalRevenue, levels) {
        let currentLevel = null;
        for (const level of levels) {
            if (totalRevenue >= level.targetAmount) {
                currentLevel = level;
            }
            else {
                break;
            }
        }
        return currentLevel;
    }
    getNextLevel(currentLevel, levels) {
        if (!currentLevel) {
            return levels[0] || null;
        }
        const currentIndex = levels.findIndex(level => level.id === currentLevel.id);
        return levels[currentIndex + 1] || null;
    }
    async createLevel(name, targetAmount, description, order) {
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
};
exports.ObjectivesService = ObjectivesService;
exports.ObjectivesService = ObjectivesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ObjectivesService);
//# sourceMappingURL=objectives.service.js.map