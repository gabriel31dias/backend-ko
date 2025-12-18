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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGlobalFees() {
        const settings = await this.prisma.globalSettings.findMany({
            where: {
                key: {
                    in: ['global_fixed_fee', 'global_percentage_fee'],
                },
            },
        });
        let fixedFee = 1.00;
        let percentageFee = 3.00;
        for (const setting of settings) {
            if (setting.key === 'global_fixed_fee') {
                fixedFee = parseFloat(setting.value);
            }
            else if (setting.key === 'global_percentage_fee') {
                percentageFee = parseFloat(setting.value);
            }
        }
        return { fixedFee, percentageFee };
    }
    async updateGlobalFees(dto) {
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
    async getUserEffectiveFees(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fixedFee: true, percentageFee: true },
        });
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        const globalFees = await this.getGlobalFees();
        const effectiveFees = {
            fixedFee: user.fixedFee !== null ? user.fixedFee : globalFees.fixedFee,
            percentageFee: user.percentageFee !== null ? user.percentageFee : globalFees.percentageFee,
        };
        return effectiveFees;
    }
    toDomain(setting) {
        return {
            id: setting.id,
            key: setting.key,
            value: setting.value,
            description: setting.description,
            createdAt: setting.createdAt,
            updatedAt: setting.updatedAt,
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map