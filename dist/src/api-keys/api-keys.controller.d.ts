import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKeysPaginationQueryDto } from './dto/pagination-query.dto';
import { User } from '../users/user.entity';
import { ApiKeyResponse, PaginatedApiKeys } from './entities/api-key.entity';
export declare class ApiKeysController {
    private readonly apiKeysService;
    constructor(apiKeysService: ApiKeysService);
    create(user: User, createApiKeyDto: CreateApiKeyDto): Promise<ApiKeyResponse>;
    findAll(user: User, query: ApiKeysPaginationQueryDto): Promise<PaginatedApiKeys>;
    findOne(user: User, id: string): Promise<ApiKeyResponse>;
    update(user: User, id: string, updateApiKeyDto: UpdateApiKeyDto): Promise<ApiKeyResponse>;
    remove(user: User, id: string): Promise<void>;
}
//# sourceMappingURL=api-keys.controller.d.ts.map