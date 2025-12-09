import { CreateUserDto } from './dto/create-user.dto';
import { UpdateFeesDto } from './dto/update-fees.dto';
import { DocumentUploadPaths, UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUser(payload: CreateUserDto, files?: UploadedDocumentFiles): Promise<{
        publicKey: string;
        secretKey: string;
        id: string;
        name: string;
        email: string;
        phone?: string;
        operationType?: string;
        averageTicket?: number;
        cpf?: string;
        cnpj?: string;
        corporateName?: string;
        salesPageLink?: string;
        address?: import("./user.entity").AddressSnapshot;
        documents?: import("./user.entity").DocumentsSnapshot;
        wallet: import("./user.entity").WalletSnapshot;
        fixedFee?: number;
        percentageFee?: number;
    }>;
    updateFees(id: string, updateFeesDto: UpdateFeesDto): Promise<{
        publicKey: string;
        secretKey: string;
        id: string;
        name: string;
        email: string;
        phone?: string;
        operationType?: string;
        averageTicket?: number;
        cpf?: string;
        cnpj?: string;
        corporateName?: string;
        salesPageLink?: string;
        address?: import("./user.entity").AddressSnapshot;
        documents?: import("./user.entity").DocumentsSnapshot;
        wallet: import("./user.entity").WalletSnapshot;
        fixedFee?: number;
        percentageFee?: number;
    }>;
    private extractDocumentPaths;
    private resolveFilePath;
    private toResponse;
}
type UploadedDocumentFiles = {
    [K in keyof DocumentUploadPaths]?: StoredFile[];
};
interface StoredFile {
    filename: string;
    path?: string;
}
export {};
//# sourceMappingURL=users.controller.d.ts.map