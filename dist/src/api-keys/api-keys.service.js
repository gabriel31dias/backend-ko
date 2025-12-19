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
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
let ApiKeysService = class ApiKeysService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const activeKeysCount = await this.prisma.apiKey.count({
            where: {
                userId,
                isActive: true,
            },
        });
        if (activeKeysCount >= 10) {
            throw new common_1.BadRequestException('Limite máximo de 10 chaves API ativas atingido');
        }
        const existingKey = await this.prisma.apiKey.findFirst({
            where: {
                userId,
                name: dto.name,
            },
        });
        if (existingKey) {
            throw new common_1.BadRequestException('Já existe uma chave API com este nome');
        }
        const publicKey = this.generatePublicKey();
        const secretKey = this.generateSecretKey();
        const apiKey = await this.prisma.apiKey.create({
            data: {
                name: dto.name,
                publicKey,
                secretKey,
                userId,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
            },
        });
        return {
            id: apiKey.id,
            name: apiKey.name,
            publicKey: apiKey.publicKey,
            secretKey: apiKey.secretKey,
            isActive: apiKey.isActive,
            lastUsedAt: apiKey.lastUsedAt,
            expiresAt: apiKey.expiresAt,
            createdAt: apiKey.createdAt,
            updatedAt: apiKey.updatedAt,
        };
    }
    async findAllPaginated(userId, query) {
        try {
            const page = parseInt(query.page || '1');
            const limit = parseInt(query.limit || '10');
            const skip = (page - 1) * limit;
            const where = {
                userId,
            };
            if (query.isActive !== undefined) {
                where.isActive = query.isActive === 'true';
            }
            if (query.search) {
                where.OR = [
                    {
                        name: {
                            contains: query.search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        publicKey: {
                            contains: query.search,
                            mode: 'insensitive',
                        },
                    },
                ];
            }
            const sortBy = query.sortBy || 'createdAt';
            const sortOrder = query.sortOrder || 'desc';
            let orderBy = { createdAt: 'desc' };
            if (['createdAt', 'name', 'lastUsedAt', 'expiresAt'].includes(sortBy)) {
                orderBy = { [sortBy]: sortOrder };
            }
            const [apiKeys, total] = await Promise.all([
                this.prisma.apiKey.findMany({
                    where,
                    orderBy,
                    skip,
                    take: limit,
                }),
                this.prisma.apiKey.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                apiKeys: apiKeys.map(key => ({
                    id: key.id,
                    name: key.name,
                    publicKey: key.publicKey,
                    isActive: key.isActive,
                    lastUsedAt: key.lastUsedAt,
                    expiresAt: key.expiresAt,
                    createdAt: key.createdAt,
                    updatedAt: key.updatedAt,
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            };
        }
        catch (error) {
            console.error('Error in findAllPaginated:', error);
            throw error;
        }
    }
    async findOne(userId, id) {
        const apiKey = await this.prisma.apiKey.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!apiKey) {
            throw new common_1.NotFoundException('Chave API não encontrada');
        }
        return {
            id: apiKey.id,
            name: apiKey.name,
            publicKey: apiKey.publicKey,
            isActive: apiKey.isActive,
            lastUsedAt: apiKey.lastUsedAt,
            expiresAt: apiKey.expiresAt,
            createdAt: apiKey.createdAt,
            updatedAt: apiKey.updatedAt,
        };
    }
    async update(userId, id, dto) {
        const existingKey = await this.prisma.apiKey.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!existingKey) {
            throw new common_1.NotFoundException('Chave API não encontrada');
        }
        if (dto.name && dto.name !== existingKey.name) {
            const nameExists = await this.prisma.apiKey.findFirst({
                where: {
                    userId,
                    name: dto.name,
                    id: { not: id },
                },
            });
            if (nameExists) {
                throw new common_1.BadRequestException('Já existe uma chave API com este nome');
            }
        }
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.isActive !== undefined)
            updateData.isActive = dto.isActive;
        if (dto.expiresAt !== undefined) {
            updateData.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
        }
        const apiKey = await this.prisma.apiKey.update({
            where: { id },
            data: updateData,
        });
        return {
            id: apiKey.id,
            name: apiKey.name,
            publicKey: apiKey.publicKey,
            isActive: apiKey.isActive,
            lastUsedAt: apiKey.lastUsedAt,
            expiresAt: apiKey.expiresAt,
            createdAt: apiKey.createdAt,
            updatedAt: apiKey.updatedAt,
        };
    }
    async remove(userId, id) {
        const existingKey = await this.prisma.apiKey.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!existingKey) {
            throw new common_1.NotFoundException('Chave API não encontrada');
        }
        await this.prisma.apiKey.delete({
            where: { id },
        });
    }
    async validateApiCredentials(publicKey, secretKey) {
        const apiKey = await this.prisma.apiKey.findFirst({
            where: {
                publicKey,
                secretKey,
                isActive: true,
            },
        });
        if (!apiKey) {
            throw new common_1.BadRequestException('Credenciais de API inválidas');
        }
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Chave API expirada');
        }
        await this.prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
        });
        return {
            userId: apiKey.userId,
            apiKeyId: apiKey.id,
        };
    }
    generatePublicKey() {
        return `pk_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`;
    }
    generateSecretKey() {
        return `sk_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`;
    }
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map