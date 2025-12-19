"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const reject_documents_dto_1 = require("./dto/reject-documents.dto");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardMetrics(query) {
        const { startDate, endDate } = this.calculateDateRange(query);
        const whereCondition = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: 'approved',
        };
        const [transactionsWithoutDiscount, transactionsWithDiscount, totalCount, cardTransactions, pixTransactions] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: Object.assign(Object.assign({}, whereCondition), { OR: [
                        { totalFeesApplied: null },
                        { totalFeesApplied: 0 }
                    ] }),
                _sum: { amount: true }
            }),
            this.prisma.transaction.aggregate({
                where: Object.assign(Object.assign({}, whereCondition), { totalFeesApplied: { gt: 0 } }),
                _sum: { amount: true }
            }),
            this.prisma.transaction.count({
                where: whereCondition
            }),
            this.prisma.transaction.aggregate({
                where: Object.assign(Object.assign({}, whereCondition), { paymentMethod: 'card' }),
                _sum: { amount: true }
            }),
            this.prisma.transaction.aggregate({
                where: Object.assign(Object.assign({}, whereCondition), { paymentMethod: 'pix' }),
                _sum: { amount: true }
            })
        ]);
        return {
            totalTransactionsWithoutDiscount: transactionsWithoutDiscount._sum.amount || 0,
            totalTransactionsWithDiscount: transactionsWithDiscount._sum.amount || 0,
            totalTransactionsCount: totalCount,
            totalByPaymentMethod: {
                card: cardTransactions._sum.amount || 0,
                pix: pixTransactions._sum.amount || 0
            },
            period: {
                start: startDate,
                end: endDate
            }
        };
    }
    async getAllTransactions(query) {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '20');
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.paymentMethod) {
            where.paymentMethod = query.paymentMethod;
        }
        if (query.customerName) {
            where.customerName = {
                contains: query.customerName,
                mode: 'insensitive',
            };
        }
        if (query.userId) {
            where.receiverUserId = query.userId;
        }
        if (query.transactionId) {
            where.transactionId = {
                contains: query.transactionId,
                mode: 'insensitive',
            };
        }
        if (query.search) {
            where.OR = [
                {
                    customerName: {
                        contains: query.search,
                        mode: 'insensitive',
                    },
                },
                {
                    customerEmail: {
                        contains: query.search,
                        mode: 'insensitive',
                    },
                },
                {
                    customerTaxId: {
                        contains: query.search,
                        mode: 'insensitive',
                    },
                },
                {
                    transactionId: {
                        contains: query.search,
                        mode: 'insensitive',
                    },
                },
            ];
        }
        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate) {
                const startDate = query.startDate.includes('T') ?
                    new Date(query.startDate) :
                    new Date(query.startDate + 'T00:00:00');
                where.createdAt.gte = startDate;
            }
            if (query.endDate) {
                const endDate = query.endDate.includes('T') ?
                    new Date(query.endDate) :
                    new Date(query.endDate + 'T23:59:59');
                where.createdAt.lte = endDate;
            }
        }
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                include: {
                    receiver: {
                        select: {
                            name: true,
                            email: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.transaction.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            transactions: transactions.map(t => ({
                id: t.id,
                amount: t.amount,
                paymentMethod: t.paymentMethod,
                status: t.status,
                transactionId: t.transactionId,
                description: t.description,
                customerName: t.customerName,
                customerEmail: t.customerEmail,
                customerPhone: t.customerPhone,
                customerDocument: t.customerDocument,
                customerType: t.customerType,
                customerTaxId: t.customerTaxId,
                receiverUserId: t.receiverUserId,
                receiverUserName: t.receiver.name,
                receiverUserEmail: t.receiver.email,
                createdAt: t.createdAt,
                approvedAt: t.approvedAt,
                grossAmount: t.grossAmount,
                fixedFeeApplied: t.fixedFeeApplied,
                percentageFeeApplied: t.percentageFeeApplied,
                totalFeesApplied: t.totalFeesApplied,
                netAmount: t.netAmount,
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
    calculateDateRange(query) {
        let startDate;
        let endDate;
        if (query.startDate && query.endDate) {
            startDate = new Date(query.startDate + 'T00:00:00');
            endDate = new Date(query.endDate + 'T23:59:59');
            const maxStartDate = new Date();
            maxStartDate.setMonth(maxStartDate.getMonth() - 3);
            if (startDate < maxStartDate) {
                startDate = maxStartDate;
            }
        }
        else {
            const today = new Date();
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        }
        return { startDate, endDate };
    }
    async getRecentTransactions() {
        const transactions = await this.prisma.transaction.findMany({
            include: {
                receiver: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        return transactions.map(t => ({
            id: t.id,
            amount: t.amount,
            paymentMethod: t.paymentMethod,
            status: t.status,
            transactionId: t.transactionId,
            description: t.description,
            customerName: t.customerName,
            customerEmail: t.customerEmail,
            customerPhone: t.customerPhone,
            customerDocument: t.customerDocument,
            customerType: t.customerType,
            customerTaxId: t.customerTaxId,
            receiverUserId: t.receiverUserId,
            receiverUserName: t.receiver.name,
            receiverUserEmail: t.receiver.email,
            createdAt: t.createdAt,
            approvedAt: t.approvedAt,
            grossAmount: t.grossAmount,
            fixedFeeApplied: t.fixedFeeApplied,
            percentageFeeApplied: t.percentageFeeApplied,
            totalFeesApplied: t.totalFeesApplied,
            netAmount: t.netAmount,
        }));
    }
    async getAllDocuments(query) {
        const pageNum = parseInt(query.page || '1');
        const limitNum = parseInt(query.limit || '10');
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.userId) {
            where.id = query.userId;
        }
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { cpf: { contains: query.search, mode: 'insensitive' } },
                { cnpj: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    cpf: true,
                    cnpj: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    notes: true,
                    pfDocumentFrontPath: true,
                    pfDocumentBackPath: true,
                    pfSelfieDocumentPath: true,
                    pfBankProofPath: true,
                    legalRepresentativeDocumentFrontPath: true,
                    legalRepresentativeDocumentBackPath: true,
                    legalRepresentativeSelfiePath: true,
                    pjBankProofPath: true,
                    cnpjDocumentPath: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            this.prisma.user.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limitNum);
        const usersWithDocumentStatus = users.map(user => (Object.assign(Object.assign({}, user), { documents: this.mapUserDocuments(user), documentSummary: this.getDocumentSummary(user) })));
        return {
            users: usersWithDocumentStatus,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1,
            },
        };
    }
    mapUserDocuments(user) {
        return {
            pf: {
                documentFront: {
                    path: user.pfDocumentFrontPath,
                    status: user.pfDocumentFrontPath ? 'uploaded' : 'missing',
                    type: 'pfDocumentFront',
                    displayName: 'CPF/RG Frente'
                },
                documentBack: {
                    path: user.pfDocumentBackPath,
                    status: user.pfDocumentBackPath ? 'uploaded' : 'missing',
                    type: 'pfDocumentBack',
                    displayName: 'CPF/RG Verso'
                },
                selfieDocument: {
                    path: user.pfSelfieDocumentPath,
                    status: user.pfSelfieDocumentPath ? 'uploaded' : 'missing',
                    type: 'pfSelfieDocument',
                    displayName: 'Selfie com Documento'
                },
                bankProof: {
                    path: user.pfBankProofPath,
                    status: user.pfBankProofPath ? 'uploaded' : 'missing',
                    type: 'pfBankProof',
                    displayName: 'Comprovante Bancário PF'
                }
            },
            pj: {
                legalRepDocumentFront: {
                    path: user.legalRepresentativeDocumentFrontPath,
                    status: user.legalRepresentativeDocumentFrontPath ? 'uploaded' : 'missing',
                    type: 'pjLegalRepresentativeDocumentFront',
                    displayName: 'Documento Rep. Legal Frente'
                },
                legalRepDocumentBack: {
                    path: user.legalRepresentativeDocumentBackPath,
                    status: user.legalRepresentativeDocumentBackPath ? 'uploaded' : 'missing',
                    type: 'pjLegalRepresentativeDocumentBack',
                    displayName: 'Documento Rep. Legal Verso'
                },
                legalRepSelfie: {
                    path: user.legalRepresentativeSelfiePath,
                    status: user.legalRepresentativeSelfiePath ? 'uploaded' : 'missing',
                    type: 'pjSelfieDocument',
                    displayName: 'Selfie Rep. Legal'
                },
                bankProof: {
                    path: user.pjBankProofPath,
                    status: user.pjBankProofPath ? 'uploaded' : 'missing',
                    type: 'pjBankProof',
                    displayName: 'Comprovante Bancário PJ'
                },
                cnpjDocument: {
                    path: user.cnpjDocumentPath,
                    status: user.cnpjDocumentPath ? 'uploaded' : 'missing',
                    type: 'pjCnpjDocument',
                    displayName: 'Documento CNPJ'
                }
            }
        };
    }
    getDocumentSummary(user) {
        const allDocs = [
            user.pfDocumentFrontPath,
            user.pfDocumentBackPath,
            user.pfSelfieDocumentPath,
            user.pfBankProofPath,
            user.legalRepresentativeDocumentFrontPath,
            user.legalRepresentativeDocumentBackPath,
            user.legalRepresentativeSelfiePath,
            user.pjBankProofPath,
            user.cnpjDocumentPath,
        ];
        const uploaded = allDocs.filter(doc => !!doc).length;
        const total = allDocs.length;
        const missing = total - uploaded;
        return {
            total,
            uploaded,
            missing,
            completionRate: Math.round((uploaded / total) * 100),
        };
    }
    async rejectUserDocuments(userRejections) {
        if (!userRejections || userRejections.length === 0) {
            throw new Error('Pelo menos um usuário com documentos para rejeitar deve ser fornecido');
        }
        const userIds = userRejections.map(ur => ur.userId);
        const users = await this.prisma.user.findMany({
            where: {
                id: { in: userIds },
            },
            select: {
                id: true,
                name: true,
                email: true,
                pfDocumentFrontPath: true,
                pfDocumentBackPath: true,
                pfSelfieDocumentPath: true,
                pfBankProofPath: true,
                legalRepresentativeDocumentFrontPath: true,
                legalRepresentativeDocumentBackPath: true,
                legalRepresentativeSelfiePath: true,
                pjBankProofPath: true,
                cnpjDocumentPath: true,
            },
        });
        if (users.length === 0) {
            throw new common_1.NotFoundException('Nenhum usuário foi encontrado');
        }
        const foundUserIds = users.map(user => user.id);
        const notFoundUserIds = userIds.filter(id => !foundUserIds.includes(id));
        const rejectionResults = [];
        for (const userRejection of userRejections) {
            const user = users.find(u => u.id === userRejection.userId);
            if (!user)
                continue;
            const updateData = {
                status: 'rejected',
                updatedAt: new Date(),
            };
            const rejectedDocumentPaths = [];
            for (const docType of userRejection.rejectedDocuments) {
                switch (docType) {
                    case reject_documents_dto_1.DocumentType.PF_DOCUMENT_FRONT:
                        if (user.pfDocumentFrontPath) {
                            updateData.pfDocumentFrontPath = null;
                            rejectedDocumentPaths.push({ type: 'CPF Frente', path: user.pfDocumentFrontPath });
                        }
                        break;
                    case reject_documents_dto_1.DocumentType.PF_DOCUMENT_BACK:
                        if (user.pfDocumentBackPath) {
                            updateData.pfDocumentBackPath = null;
                            rejectedDocumentPaths.push({ type: 'CPF Verso', path: user.pfDocumentBackPath });
                        }
                        break;
                    case reject_documents_dto_1.DocumentType.PF_SELFIE_DOCUMENT:
                        if (user.pfSelfieDocumentPath) {
                            updateData.pfSelfieDocumentPath = null;
                            rejectedDocumentPaths.push({ type: 'Selfie com Documento', path: user.pfSelfieDocumentPath });
                        }
                        break;
                    case reject_documents_dto_1.DocumentType.PF_BANK_PROOF:
                        if (user.pfBankProofPath) {
                            updateData.pfBankProofPath = null;
                            rejectedDocumentPaths.push({ type: 'Comprovante Bancário PF', path: user.pfBankProofPath });
                        }
                        break;
                    case reject_documents_dto_1.DocumentType.PJ_LEGAL_REP_DOCUMENT_FRONT:
                        if (user.legalRepresentativeDocumentFrontPath) {
                            updateData.legalRepresentativeDocumentFrontPath = null;
                            rejectedDocumentPaths.push({ type: 'Documento Rep. Legal Frente', path: user.legalRepresentativeDocumentFrontPath });
                        }
                        break;
                    case reject_documents_dto_1.DocumentType.PJ_LEGAL_REP_DOCUMENT_BACK:
                        if (user.legalRepresentativeDocumentBackPath) {
                            updateData.legalRepresentativeDocumentBackPath = null;
                            rejectedDocumentPaths.push({ type: 'Documento Rep. Legal Verso', path: user.legalRepresentativeDocumentBackPath });
                        }
                        break;
                    case reject_documents_dto_1.DocumentType.PJ_SELFIE_DOCUMENT:
                        if (user.legalRepresentativeSelfiePath) {
                            updateData.legalRepresentativeSelfiePath = null;
                            rejectedDocumentPaths.push({ type: 'Selfie Rep. Legal', path: user.legalRepresentativeSelfiePath });
                        }
                        break;
                    case reject_documents_dto_1.DocumentType.PJ_BANK_PROOF:
                        if (user.pjBankProofPath) {
                            updateData.pjBankProofPath = null;
                            rejectedDocumentPaths.push({ type: 'Comprovante Bancário PJ', path: user.pjBankProofPath });
                        }
                        break;
                    case reject_documents_dto_1.DocumentType.PJ_CNPJ_DOCUMENT:
                        if (user.cnpjDocumentPath) {
                            updateData.cnpjDocumentPath = null;
                            rejectedDocumentPaths.push({ type: 'Documento CNPJ', path: user.cnpjDocumentPath });
                        }
                        break;
                }
            }
            const rejectionNote = this.createRejectionNote(userRejection, rejectedDocumentPaths);
            updateData.notes = rejectionNote;
            await this.prisma.user.update({
                where: { id: user.id },
                data: updateData,
            });
            rejectionResults.push({
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                previousStatus: 'pending',
                newStatus: 'rejected',
                rejectedDocuments: rejectedDocumentPaths,
                reason: userRejection.reason,
            });
        }
        return {
            rejectionResults,
            totalRejected: rejectionResults.length,
            notFoundUserIds,
        };
    }
    createRejectionNote(userRejection, rejectedDocumentPaths) {
        let note = 'CADASTRO REPROVADO - Documentos rejeitados pelo administrador:\n';
        rejectedDocumentPaths.forEach(doc => {
            note += `- ${doc.type}\n`;
        });
        if (userRejection.reason) {
            note += `\nMotivo: ${userRejection.reason}`;
        }
        note += `\nData da rejeição: ${new Date().toLocaleString('pt-BR')}`;
        note += `\nStatus alterado para: REJEITADO`;
        note += `\nO seller precisará reenviar todos os documentos para nova análise.`;
        return note;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map