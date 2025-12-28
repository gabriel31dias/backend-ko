import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateFeesDto } from './dto/update-fees.dto';
import { User } from './user.entity';
import { VerificationService } from '../verification/verification.service';
export interface DocumentUploadPaths {
    pfDocumentFront?: string;
    pfDocumentBack?: string;
    pfSelfieDocument?: string;
    pfBankProof?: string;
    pjLegalRepresentativeDocumentFront?: string;
    pjLegalRepresentativeDocumentBack?: string;
    pjSelfieDocument?: string;
    pjBankProof?: string;
    pjCnpjDocument?: string;
}
export declare class UsersService {
    private readonly prisma;
    private readonly verificationService;
    constructor(prisma: PrismaService, verificationService: VerificationService);
    createUser(payload: CreateUserDto, documents?: DocumentUploadPaths): Promise<User>;
    findByEmail(email?: string): Promise<User | undefined>;
    findByCpf(cpf?: string): Promise<User | undefined>;
    findByCnpj(cnpj?: string): Promise<User | undefined>;
    findById(id: string): Promise<User>;
    validateCredentials(email: string, password: string): Promise<User>;
    ensureApiKeys(user: User): Promise<User>;
    ensureApiKeysAndToken(user: User, accessToken: string): Promise<User>;
    findByToken(token: string): Promise<User | undefined>;
    private generatePublicKey;
    private generateSecretKey;
    private hashPassword;
    private verifyPassword;
    private isBcryptHash;
    updateFees(userId: string, updateFeesDto: UpdateFeesDto): Promise<User>;
    getPendingSellers(page?: number, limit?: number): Promise<{
        sellers: User[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    updateStatus(userId: string, status: string, options?: {
        notes?: string;
    }): Promise<User>;
    private toDomain;
    getUsers(params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }): Promise<{
        users: User[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getUserRejectedDocuments(userId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            status: string;
            lastUpdate: Date;
        };
        isRejected: boolean;
        rejectionNotes: string;
        rejectedDocuments: any[];
        missingDocuments: any[];
        availableDocuments: any[];
        summary: {
            total: number;
            available: number;
            missing: number;
            rejected: number;
        };
    }>;
    private parseRejectionNotes;
}
//# sourceMappingURL=users.service.d.ts.map