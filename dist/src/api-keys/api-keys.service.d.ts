import { PrismaService } from '../prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKeysPaginationQueryDto } from './dto/pagination-query.dto';
import { ApiKeyResponse, PaginatedApiKeys } from './entities/api-key.entity';
export declare class ApiKeysService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateApiKeyDto): Promise<ApiKeyResponse>;
    findAllPaginated(userId: string, query: ApiKeysPaginationQueryDto): Promise<PaginatedApiKeys>;
    findOne(userId: string, id: string): Promise<ApiKeyResponse>;
    update(userId: string, id: string, dto: UpdateApiKeyDto): Promise<ApiKeyResponse>;
    remove(userId: string, id: string): Promise<void>;
    validateApiCredentials(publicKey: string, secretKey: string): Promise<{
        userId: string;
        apiKeyId: string;
    }>;
    private generatePublicKey;
    private generateSecretKey;
}
//# sourceMappingURL=api-keys.service.d.ts.map