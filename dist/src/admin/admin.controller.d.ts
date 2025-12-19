import { AdminService } from './admin.service';
import { DashboardMetricsQueryDto } from './dto/dashboard-metrics-query.dto';
import { AdminTransactionsQueryDto } from './dto/admin-transactions-query.dto';
import { RejectDocumentsDto } from './dto/reject-documents.dto';
import { DocumentsQueryDto } from './dto/documents-query.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboardMetrics(query: DashboardMetricsQueryDto): Promise<import("./admin.service").DashboardMetrics>;
    getAllTransactions(query: AdminTransactionsQueryDto): Promise<import("./admin.service").PaginatedAdminTransactions>;
    getRecentTransactions(): Promise<import("./admin.service").AdminTransaction[]>;
    getAllDocuments(query: DocumentsQueryDto): Promise<{
        users: {
            documents: {
                pf: {
                    documentFront: {
                        path: any;
                        status: string;
                        type: string;
                        displayName: string;
                    };
                    documentBack: {
                        path: any;
                        status: string;
                        type: string;
                        displayName: string;
                    };
                    selfieDocument: {
                        path: any;
                        status: string;
                        type: string;
                        displayName: string;
                    };
                    bankProof: {
                        path: any;
                        status: string;
                        type: string;
                        displayName: string;
                    };
                };
                pj: {
                    legalRepDocumentFront: {
                        path: any;
                        status: string;
                        type: string;
                        displayName: string;
                    };
                    legalRepDocumentBack: {
                        path: any;
                        status: string;
                        type: string;
                        displayName: string;
                    };
                    legalRepSelfie: {
                        path: any;
                        status: string;
                        type: string;
                        displayName: string;
                    };
                    bankProof: {
                        path: any;
                        status: string;
                        type: string;
                        displayName: string;
                    };
                    cnpjDocument: {
                        path: any;
                        status: string;
                        type: string;
                        displayName: string;
                    };
                };
            };
            documentSummary: {
                total: number;
                uploaded: number;
                missing: number;
                completionRate: number;
            };
            createdAt: Date;
            name: string;
            id: string;
            updatedAt: Date;
            status: string;
            email: string;
            pfDocumentFrontPath: string;
            pfDocumentBackPath: string;
            pfSelfieDocumentPath: string;
            pfBankProofPath: string;
            legalRepresentativeDocumentFrontPath: string;
            legalRepresentativeDocumentBackPath: string;
            legalRepresentativeSelfiePath: string;
            pjBankProofPath: string;
            cnpjDocumentPath: string;
            cnpj: string;
            cpf: string;
            notes: string;
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
    rejectUserDocuments(rejectDocumentsDto: RejectDocumentsDto): Promise<{
        rejectionResults: any[];
        totalRejected: number;
        notFoundUserIds: string[];
    }>;
}
//# sourceMappingURL=admin.controller.d.ts.map