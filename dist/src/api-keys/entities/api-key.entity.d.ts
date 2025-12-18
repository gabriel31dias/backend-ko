export interface ApiKey {
    id: string;
    name: string;
    publicKey: string;
    secretKey: string;
    isActive: boolean;
    lastUsedAt?: Date;
    expiresAt?: Date;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ApiKeyResponse {
    id: string;
    name: string;
    publicKey: string;
    secretKey?: string;
    isActive: boolean;
    lastUsedAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface PaginatedApiKeys {
    apiKeys: ApiKeyResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
//# sourceMappingURL=api-key.entity.d.ts.map