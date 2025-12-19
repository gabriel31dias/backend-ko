import { UserDocumentRejection } from './dto/reject-documents.dto';
import { DocumentsQueryDto } from './dto/documents-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardMetricsQueryDto } from './dto/dashboard-metrics-query.dto';
import { AdminTransactionsQueryDto } from './dto/admin-transactions-query.dto';
export interface DashboardMetrics {
    totalTransactionsWithoutDiscount: number;
    totalTransactionsWithDiscount: number;
    totalTransactionsCount: number;
    totalByPaymentMethod: {
        card: number;
        pix: number;
    };
    period: {
        start: Date;
        end: Date;
    };
}
export interface AdminTransaction {
    id: string;
    amount: number;
    paymentMethod: 'pix' | 'card';
    status: 'pending' | 'waiting' | 'approved' | 'rejected';
    transactionId: string;
    description: string | null;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    customerDocument: string | null;
    customerType: 'pf' | 'pj';
    customerTaxId: string;
    receiverUserId: string;
    receiverUserName: string;
    receiverUserEmail: string;
    createdAt: Date;
    approvedAt: Date | null;
    grossAmount: number | null;
    fixedFeeApplied: number | null;
    percentageFeeApplied: number | null;
    totalFeesApplied: number | null;
    netAmount: number | null;
}
export interface PaginatedAdminTransactions {
    transactions: AdminTransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardMetrics(query: DashboardMetricsQueryDto): Promise<DashboardMetrics>;
    getAllTransactions(query: AdminTransactionsQueryDto): Promise<PaginatedAdminTransactions>;
    private calculateDateRange;
    getRecentTransactions(): Promise<AdminTransaction[]>;
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
    private mapUserDocuments;
    private getDocumentSummary;
    rejectUserDocuments(userRejections: UserDocumentRejection[]): Promise<{
        rejectionResults: any[];
        totalRejected: number;
        notFoundUserIds: string[];
    }>;
    private createRejectionNote;
}
//# sourceMappingURL=admin.service.d.ts.map