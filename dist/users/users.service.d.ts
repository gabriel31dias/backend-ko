import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateFeesDto } from './dto/update-fees.dto';
import { User } from './user.entity';
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
    constructor(prisma: PrismaService);
    createUser(payload: CreateUserDto, documents?: DocumentUploadPaths): Promise<User>;
    findByEmail(email: string): Promise<User | undefined>;
    findById(id: string): Promise<User>;
    validateCredentials(email: string, password: string): Promise<User>;
    ensureApiKeys(user: User): Promise<User>;
    ensureApiKeysAndToken(user: User, accessToken: string): Promise<User>;
    findByToken(token: string): Promise<User | undefined>;
    private generatePublicKey;
    private generateSecretKey;
    updateFees(userId: string, updateFeesDto: UpdateFeesDto): Promise<User>;
    private toDomain;
}
//# sourceMappingURL=users.service.d.ts.map