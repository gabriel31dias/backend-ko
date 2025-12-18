import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKeysPaginationQueryDto } from './dto/pagination-query.dto';
import { ApiKey, ApiKeyResponse, PaginatedApiKeys } from './entities/api-key.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateApiKeyDto): Promise<ApiKeyResponse> {
    // Verificar se o usuário já tem muitas chaves ativas (limite de 10)
    const activeKeysCount = await this.prisma.apiKey.count({
      where: {
        userId,
        isActive: true,
      },
    });

    if (activeKeysCount >= 10) {
      throw new BadRequestException('Limite máximo de 10 chaves API ativas atingido');
    }

    // Verificar se já existe uma chave com esse nome para o usuário
    const existingKey = await this.prisma.apiKey.findFirst({
      where: {
        userId,
        name: dto.name,
      },
    });

    if (existingKey) {
      throw new BadRequestException('Já existe uma chave API com este nome');
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
      secretKey: apiKey.secretKey, // Retorna na criação
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }

  async findAllPaginated(userId: string, query: ApiKeysPaginationQueryDto): Promise<PaginatedApiKeys> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {
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

    const [apiKeys, total] = await Promise.all([
      this.prisma.apiKey.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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
        // Não retorna secretKey na listagem
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

  async findOne(userId: string, id: string): Promise<ApiKeyResponse> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('Chave API não encontrada');
    }

    return {
      id: apiKey.id,
      name: apiKey.name,
      publicKey: apiKey.publicKey,
      // Não retorna secretKey
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }

  async update(userId: string, id: string, dto: UpdateApiKeyDto): Promise<ApiKeyResponse> {
    const existingKey = await this.prisma.apiKey.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingKey) {
      throw new NotFoundException('Chave API não encontrada');
    }

    // Se mudando o nome, verificar se já existe outro com o mesmo nome
    if (dto.name && dto.name !== existingKey.name) {
      const nameExists = await this.prisma.apiKey.findFirst({
        where: {
          userId,
          name: dto.name,
          id: { not: id },
        },
      });

      if (nameExists) {
        throw new BadRequestException('Já existe uma chave API com este nome');
      }
    }

    const updateData: any = {};
    
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
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

  async remove(userId: string, id: string): Promise<void> {
    const existingKey = await this.prisma.apiKey.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingKey) {
      throw new NotFoundException('Chave API não encontrada');
    }

    await this.prisma.apiKey.delete({
      where: { id },
    });
  }

  async validateApiCredentials(publicKey: string, secretKey: string): Promise<{ userId: string; apiKeyId: string }> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        publicKey,
        secretKey,
        isActive: true,
      },
    });

    if (!apiKey) {
      throw new BadRequestException('Credenciais de API inválidas');
    }

    // Verificar se a chave expirou
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new BadRequestException('Chave API expirada');
    }

    // Atualizar lastUsedAt
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      userId: apiKey.userId,
      apiKeyId: apiKey.id,
    };
  }

  private generatePublicKey(): string {
    return `pk_${randomUUID().replace(/-/g, '')}`;
  }

  private generateSecretKey(): string {
    return `sk_${randomUUID().replace(/-/g, '')}`;
  }
}