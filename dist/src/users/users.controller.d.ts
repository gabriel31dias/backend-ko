import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateFeesDto } from './dto/update-fees.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApprovalNotesDto } from './dto/approval-notes.dto';
import { RejectUserDto } from './dto/reject-user.dto';
import { DocumentUploadPaths, UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUser(payload: CreateUserDto, files?: UploadedDocumentFiles, req?: Request): Promise<{
        documents: {
            pf: {
                documentFront: string;
                documentBack: string;
                selfieWithDocument: string;
                bankProof: string;
            };
            pj: {
                legalRepresentativeDocumentFront: string;
                legalRepresentativeDocumentBack: string;
                legalRepresentativeSelfie: string;
                bankProof: string;
                cnpjDocument: string;
            };
            name?: string;
            cpf?: string;
        };
        documentFiles: {
            pfDocumentFront: string;
            pfDocumentBack: string;
            pfSelfieDocument: string;
            pfBankProof: string;
            pjLegalRepresentativeDocumentFront: string;
            pjLegalRepresentativeDocumentBack: string;
            pjSelfieDocument: string;
            pjBankProof: string;
            pjCnpjDocument: string;
        };
        publicKey: string;
        secretKey: string;
        id: string;
        name: string;
        email: string;
        phone?: string;
        status?: string;
        operationType?: string;
        averageTicket?: number;
        cpf?: string;
        cnpj?: string;
        corporateName?: string;
        salesPageLink?: string;
        address?: import("./user.entity").AddressSnapshot;
        wallet: import("./user.entity").WalletSnapshot;
        fixedFee?: number;
        percentageFee?: number;
        notes?: string;
    }>;
    updateFees(id: string, updateFeesDto: UpdateFeesDto, req?: Request): Promise<{
        documents: {
            pf: {
                documentFront: string;
                documentBack: string;
                selfieWithDocument: string;
                bankProof: string;
            };
            pj: {
                legalRepresentativeDocumentFront: string;
                legalRepresentativeDocumentBack: string;
                legalRepresentativeSelfie: string;
                bankProof: string;
                cnpjDocument: string;
            };
            name?: string;
            cpf?: string;
        };
        documentFiles: {
            pfDocumentFront: string;
            pfDocumentBack: string;
            pfSelfieDocument: string;
            pfBankProof: string;
            pjLegalRepresentativeDocumentFront: string;
            pjLegalRepresentativeDocumentBack: string;
            pjSelfieDocument: string;
            pjBankProof: string;
            pjCnpjDocument: string;
        };
        publicKey: string;
        secretKey: string;
        id: string;
        name: string;
        email: string;
        phone?: string;
        status?: string;
        operationType?: string;
        averageTicket?: number;
        cpf?: string;
        cnpj?: string;
        corporateName?: string;
        salesPageLink?: string;
        address?: import("./user.entity").AddressSnapshot;
        wallet: import("./user.entity").WalletSnapshot;
        fixedFee?: number;
        percentageFee?: number;
        notes?: string;
    }>;
    getPendingSellers(page?: string, limit?: string, req?: Request): Promise<{
        sellers: {
            documents: {
                pf: {
                    documentFront: string;
                    documentBack: string;
                    selfieWithDocument: string;
                    bankProof: string;
                };
                pj: {
                    legalRepresentativeDocumentFront: string;
                    legalRepresentativeDocumentBack: string;
                    legalRepresentativeSelfie: string;
                    bankProof: string;
                    cnpjDocument: string;
                };
                name?: string;
                cpf?: string;
            };
            documentFiles: {
                pfDocumentFront: string;
                pfDocumentBack: string;
                pfSelfieDocument: string;
                pfBankProof: string;
                pjLegalRepresentativeDocumentFront: string;
                pjLegalRepresentativeDocumentBack: string;
                pjSelfieDocument: string;
                pjBankProof: string;
                pjCnpjDocument: string;
            };
            publicKey: string;
            secretKey: string;
            id: string;
            name: string;
            email: string;
            phone?: string;
            status?: string;
            operationType?: string;
            averageTicket?: number;
            cpf?: string;
            cnpj?: string;
            corporateName?: string;
            salesPageLink?: string;
            address?: import("./user.entity").AddressSnapshot;
            wallet: import("./user.entity").WalletSnapshot;
            fixedFee?: number;
            percentageFee?: number;
            notes?: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getUsers(req: Request, page?: string, limit?: string, status?: string, search?: string): Promise<{
        users: {
            documents: {
                pf: {
                    documentFront: string;
                    documentBack: string;
                    selfieWithDocument: string;
                    bankProof: string;
                };
                pj: {
                    legalRepresentativeDocumentFront: string;
                    legalRepresentativeDocumentBack: string;
                    legalRepresentativeSelfie: string;
                    bankProof: string;
                    cnpjDocument: string;
                };
                name?: string;
                cpf?: string;
            };
            documentFiles: {
                pfDocumentFront: string;
                pfDocumentBack: string;
                pfSelfieDocument: string;
                pfBankProof: string;
                pjLegalRepresentativeDocumentFront: string;
                pjLegalRepresentativeDocumentBack: string;
                pjSelfieDocument: string;
                pjBankProof: string;
                pjCnpjDocument: string;
            };
            publicKey: string;
            secretKey: string;
            id: string;
            name: string;
            email: string;
            phone?: string;
            status?: string;
            operationType?: string;
            averageTicket?: number;
            cpf?: string;
            cnpj?: string;
            corporateName?: string;
            salesPageLink?: string;
            address?: import("./user.entity").AddressSnapshot;
            wallet: import("./user.entity").WalletSnapshot;
            fixedFee?: number;
            percentageFee?: number;
            notes?: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getUserById(id: string, req?: Request): Promise<{
        documents: {
            pf: {
                documentFront: string;
                documentBack: string;
                selfieWithDocument: string;
                bankProof: string;
            };
            pj: {
                legalRepresentativeDocumentFront: string;
                legalRepresentativeDocumentBack: string;
                legalRepresentativeSelfie: string;
                bankProof: string;
                cnpjDocument: string;
            };
            name?: string;
            cpf?: string;
        };
        documentFiles: {
            pfDocumentFront: string;
            pfDocumentBack: string;
            pfSelfieDocument: string;
            pfBankProof: string;
            pjLegalRepresentativeDocumentFront: string;
            pjLegalRepresentativeDocumentBack: string;
            pjSelfieDocument: string;
            pjBankProof: string;
            pjCnpjDocument: string;
        };
        publicKey: string;
        secretKey: string;
        id: string;
        name: string;
        email: string;
        phone?: string;
        status?: string;
        operationType?: string;
        averageTicket?: number;
        cpf?: string;
        cnpj?: string;
        corporateName?: string;
        salesPageLink?: string;
        address?: import("./user.entity").AddressSnapshot;
        wallet: import("./user.entity").WalletSnapshot;
        fixedFee?: number;
        percentageFee?: number;
        notes?: string;
    }>;
    updateUser(id: string, updateStatusDto: UpdateStatusDto, req?: Request): Promise<{
        documents: {
            pf: {
                documentFront: string;
                documentBack: string;
                selfieWithDocument: string;
                bankProof: string;
            };
            pj: {
                legalRepresentativeDocumentFront: string;
                legalRepresentativeDocumentBack: string;
                legalRepresentativeSelfie: string;
                bankProof: string;
                cnpjDocument: string;
            };
            name?: string;
            cpf?: string;
        };
        documentFiles: {
            pfDocumentFront: string;
            pfDocumentBack: string;
            pfSelfieDocument: string;
            pfBankProof: string;
            pjLegalRepresentativeDocumentFront: string;
            pjLegalRepresentativeDocumentBack: string;
            pjSelfieDocument: string;
            pjBankProof: string;
            pjCnpjDocument: string;
        };
        publicKey: string;
        secretKey: string;
        id: string;
        name: string;
        email: string;
        phone?: string;
        status?: string;
        operationType?: string;
        averageTicket?: number;
        cpf?: string;
        cnpj?: string;
        corporateName?: string;
        salesPageLink?: string;
        address?: import("./user.entity").AddressSnapshot;
        wallet: import("./user.entity").WalletSnapshot;
        fixedFee?: number;
        percentageFee?: number;
        notes?: string;
    }>;
    approveUser(id: string, approvalNotesDto: ApprovalNotesDto, req?: Request): Promise<{
        documents: {
            pf: {
                documentFront: string;
                documentBack: string;
                selfieWithDocument: string;
                bankProof: string;
            };
            pj: {
                legalRepresentativeDocumentFront: string;
                legalRepresentativeDocumentBack: string;
                legalRepresentativeSelfie: string;
                bankProof: string;
                cnpjDocument: string;
            };
            name?: string;
            cpf?: string;
        };
        documentFiles: {
            pfDocumentFront: string;
            pfDocumentBack: string;
            pfSelfieDocument: string;
            pfBankProof: string;
            pjLegalRepresentativeDocumentFront: string;
            pjLegalRepresentativeDocumentBack: string;
            pjSelfieDocument: string;
            pjBankProof: string;
            pjCnpjDocument: string;
        };
        publicKey: string;
        secretKey: string;
        id: string;
        name: string;
        email: string;
        phone?: string;
        status?: string;
        operationType?: string;
        averageTicket?: number;
        cpf?: string;
        cnpj?: string;
        corporateName?: string;
        salesPageLink?: string;
        address?: import("./user.entity").AddressSnapshot;
        wallet: import("./user.entity").WalletSnapshot;
        fixedFee?: number;
        percentageFee?: number;
        notes?: string;
    }>;
    rejectUser(id: string, rejectUserDto: RejectUserDto, req?: Request): Promise<{
        documents: {
            pf: {
                documentFront: string;
                documentBack: string;
                selfieWithDocument: string;
                bankProof: string;
            };
            pj: {
                legalRepresentativeDocumentFront: string;
                legalRepresentativeDocumentBack: string;
                legalRepresentativeSelfie: string;
                bankProof: string;
                cnpjDocument: string;
            };
            name?: string;
            cpf?: string;
        };
        documentFiles: {
            pfDocumentFront: string;
            pfDocumentBack: string;
            pfSelfieDocument: string;
            pfBankProof: string;
            pjLegalRepresentativeDocumentFront: string;
            pjLegalRepresentativeDocumentBack: string;
            pjSelfieDocument: string;
            pjBankProof: string;
            pjCnpjDocument: string;
        };
        publicKey: string;
        secretKey: string;
        id: string;
        name: string;
        email: string;
        phone?: string;
        status?: string;
        operationType?: string;
        averageTicket?: number;
        cpf?: string;
        cnpj?: string;
        corporateName?: string;
        salesPageLink?: string;
        address?: import("./user.entity").AddressSnapshot;
        wallet: import("./user.entity").WalletSnapshot;
        fixedFee?: number;
        percentageFee?: number;
        notes?: string;
    }>;
    updateStatus(id: string, body: UpdateStatusDto, req?: Request): Promise<{
        documents: {
            pf: {
                documentFront: string;
                documentBack: string;
                selfieWithDocument: string;
                bankProof: string;
            };
            pj: {
                legalRepresentativeDocumentFront: string;
                legalRepresentativeDocumentBack: string;
                legalRepresentativeSelfie: string;
                bankProof: string;
                cnpjDocument: string;
            };
            name?: string;
            cpf?: string;
        };
        documentFiles: {
            pfDocumentFront: string;
            pfDocumentBack: string;
            pfSelfieDocument: string;
            pfBankProof: string;
            pjLegalRepresentativeDocumentFront: string;
            pjLegalRepresentativeDocumentBack: string;
            pjSelfieDocument: string;
            pjBankProof: string;
            pjCnpjDocument: string;
        };
        publicKey: string;
        secretKey: string;
        id: string;
        name: string;
        email: string;
        phone?: string;
        status?: string;
        operationType?: string;
        averageTicket?: number;
        cpf?: string;
        cnpj?: string;
        corporateName?: string;
        salesPageLink?: string;
        address?: import("./user.entity").AddressSnapshot;
        wallet: import("./user.entity").WalletSnapshot;
        fixedFee?: number;
        percentageFee?: number;
        notes?: string;
    }>;
    getMyRejectedDocuments(user: any, req?: Request): Promise<{
        documentsUrls: {};
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
    private extractDocumentPaths;
    private resolveFilePath;
    private toResponse;
    private buildDocumentsResponse;
    private buildFileUrl;
    private getBaseUrl;
    private buildDocumentFiles;
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