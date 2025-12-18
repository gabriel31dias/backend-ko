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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
const bcryptjs_1 = require("bcryptjs");
const VALID_STATUSES = ['pending', 'approved', 'rejected'];
const PASSWORD_SALT_ROUNDS = 10;
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUser(payload, documents = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const normalizedEmail = ((_a = payload.email) !== null && _a !== void 0 ? _a : '').trim();
        const normalizedCpf = (_b = payload.cpf) === null || _b === void 0 ? void 0 : _b.trim();
        const normalizedCnpj = (_c = payload.cnpj) === null || _c === void 0 ? void 0 : _c.trim();
        const existing = await this.findByEmail(normalizedEmail);
        if (existing) {
            throw new common_1.ConflictException('E-mail já cadastrado');
        }
        if (normalizedCpf) {
            const cpfConflict = await this.findByCpf(normalizedCpf);
            if (cpfConflict) {
                throw new common_1.ConflictException('CPF já cadastrado');
            }
        }
        if (normalizedCnpj) {
            const cnpjConflict = await this.findByCnpj(normalizedCnpj);
            if (cnpjConflict) {
                throw new common_1.ConflictException('CNPJ já cadastrado');
            }
        }
        const hashedPassword = await this.hashPassword(payload.password);
        const created = await this.prisma.user.create({
            data: {
                name: payload.name,
                email: normalizedEmail.toLowerCase(),
                phone: payload.phone,
                password: hashedPassword,
                operationType: payload.operationType,
                averageTicket: payload.averageTicket,
                cpf: normalizedCpf,
                cnpj: normalizedCnpj,
                corporateName: payload.corporateName,
                salesPageLink: payload.salesPageLink,
                addressCep: (_d = payload.address) === null || _d === void 0 ? void 0 : _d.cep,
                addressStreet: (_e = payload.address) === null || _e === void 0 ? void 0 : _e.street,
                addressNumber: (_f = payload.address) === null || _f === void 0 ? void 0 : _f.number,
                addressComplement: (_g = payload.address) === null || _g === void 0 ? void 0 : _g.complement,
                addressNeighborhood: (_h = payload.address) === null || _h === void 0 ? void 0 : _h.neighborhood,
                addressCity: (_j = payload.address) === null || _j === void 0 ? void 0 : _j.city,
                addressState: (_k = payload.address) === null || _k === void 0 ? void 0 : _k.state,
                documentName: (_l = payload.documents) === null || _l === void 0 ? void 0 : _l.name,
                documentCpf: (_m = payload.documents) === null || _m === void 0 ? void 0 : _m.cpf,
                pfDocumentFrontPath: documents.pfDocumentFront,
                pfDocumentBackPath: documents.pfDocumentBack,
                pfSelfieDocumentPath: documents.pfSelfieDocument,
                pfBankProofPath: documents.pfBankProof,
                legalRepresentativeDocumentFrontPath: documents.pjLegalRepresentativeDocumentFront,
                legalRepresentativeDocumentBackPath: documents.pjLegalRepresentativeDocumentBack,
                legalRepresentativeSelfiePath: documents.pjSelfieDocument,
                pjBankProofPath: documents.pjBankProof,
                cnpjDocumentPath: documents.pjCnpjDocument,
                publicKey: this.generatePublicKey(),
                secretKey: this.generateSecretKey(),
            },
        });
        return this.toDomain(created);
    }
    async findByEmail(email) {
        if (!email) {
            return;
        }
        const normalizedEmail = email.toLowerCase();
        const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
        return user ? this.toDomain(user) : undefined;
    }
    async findByCpf(cpf) {
        const normalizedCpf = cpf === null || cpf === void 0 ? void 0 : cpf.trim();
        if (!normalizedCpf) {
            return;
        }
        const user = await this.prisma.user.findFirst({ where: { cpf: normalizedCpf } });
        return user ? this.toDomain(user) : undefined;
    }
    async findByCnpj(cnpj) {
        const normalizedCnpj = cnpj === null || cnpj === void 0 ? void 0 : cnpj.trim();
        if (!normalizedCnpj) {
            return;
        }
        const user = await this.prisma.user.findFirst({ where: { cnpj: normalizedCnpj } });
        return user ? this.toDomain(user) : undefined;
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return this.toDomain(user);
    }
    async validateCredentials(email, password) {
        const user = await this.findByEmail(email === null || email === void 0 ? void 0 : email.trim());
        if (!user) {
            throw new common_1.NotFoundException('Credenciais inválidas');
        }
        const isPasswordValid = await this.verifyPassword(password !== null && password !== void 0 ? password : '', user.password);
        if (!isPasswordValid) {
            throw new common_1.NotFoundException('Credenciais inválidas');
        }
        return user;
    }
    async ensureApiKeys(user) {
        if (user.publicKey && user.secretKey) {
            return user;
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                publicKey: this.generatePublicKey(),
                secretKey: this.generateSecretKey(),
            },
        });
        return this.toDomain(updatedUser);
    }
    async ensureApiKeysAndToken(user, accessToken) {
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                publicKey: user.publicKey || this.generatePublicKey(),
                secretKey: user.secretKey || this.generateSecretKey(),
                accessToken: accessToken,
            },
        });
        return this.toDomain(updatedUser);
    }
    async findByToken(token) {
        if (!token) {
            return;
        }
        const user = await this.prisma.user.findFirst({
            where: { accessToken: token }
        });
        return user ? this.toDomain(user) : undefined;
    }
    generatePublicKey() {
        const uuid = (0, crypto_1.randomUUID)().replace(/-/g, '');
        return `pk_${uuid.substring(0, 24)}`;
    }
    generateSecretKey() {
        const uuid1 = (0, crypto_1.randomUUID)().replace(/-/g, '');
        const uuid2 = (0, crypto_1.randomUUID)().replace(/-/g, '');
        return `sk_${uuid1}${uuid2.substring(0, 16)}`;
    }
    async hashPassword(password) {
        return (0, bcryptjs_1.hash)(password, PASSWORD_SALT_ROUNDS);
    }
    async verifyPassword(raw, stored) {
        if (!stored) {
            return false;
        }
        if (this.isBcryptHash(stored)) {
            return (0, bcryptjs_1.compare)(raw, stored);
        }
        return stored === raw;
    }
    isBcryptHash(value) {
        return value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$');
    }
    async updateFees(userId, updateFeesDto) {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                fixedFee: updateFeesDto.fixedFee,
                percentageFee: updateFeesDto.percentageFee,
            },
        });
        return this.toDomain(updatedUser);
    }
    async getPendingSellers(page = 1, limit = 10) {
        const result = await this.getUsers({ page, limit, status: 'pending' });
        return {
            sellers: result.users,
            pagination: result.pagination,
        };
    }
    async updateStatus(userId, status, options = {}) {
        var _a;
        const normalizedStatus = status === null || status === void 0 ? void 0 : status.toLowerCase();
        if (!VALID_STATUSES.includes(normalizedStatus)) {
            throw new common_1.ConflictException('Status inválido. Use: pending, approved, rejected');
        }
        const notesValue = normalizedStatus === 'rejected'
            ? (((_a = options.notes) === null || _a === void 0 ? void 0 : _a.trim()) || null)
            : null;
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { status: normalizedStatus, notes: notesValue },
        });
        return this.toDomain(updatedUser);
    }
    toDomain(model) {
        var _a;
        const wallet = {
            balance: model.walletBalance,
            valorReceber: model.walletValorReceber,
            grossBalance: model.walletGrossBalance,
            currency: model.walletCurrency,
        };
        const address = model.addressCep ? {
            cep: model.addressCep,
            street: model.addressStreet,
            number: model.addressNumber,
            complement: model.addressComplement,
            neighborhood: model.addressNeighborhood,
            city: model.addressCity,
            state: model.addressState,
        } : undefined;
        const pfDocuments = model.pfDocumentFrontPath || model.pfDocumentBackPath || model.pfSelfieDocumentPath || model.pfBankProofPath ? {
            documentFront: model.pfDocumentFrontPath,
            documentBack: model.pfDocumentBackPath,
            selfieWithDocument: model.pfSelfieDocumentPath,
            bankProof: model.pfBankProofPath,
        } : undefined;
        const pjDocuments = model.legalRepresentativeDocumentFrontPath || model.legalRepresentativeDocumentBackPath || model.legalRepresentativeSelfiePath || model.pjBankProofPath || model.cnpjDocumentPath ? {
            legalRepresentativeDocumentFront: model.legalRepresentativeDocumentFrontPath,
            legalRepresentativeDocumentBack: model.legalRepresentativeDocumentBackPath,
            legalRepresentativeSelfie: model.legalRepresentativeSelfiePath,
            bankProof: model.pjBankProofPath,
            cnpjDocument: model.cnpjDocumentPath,
        } : undefined;
        const documents = model.documentName || model.documentCpf || pfDocuments || pjDocuments ? {
            name: model.documentName,
            cpf: model.documentCpf,
            pf: pfDocuments,
            pj: pjDocuments,
        } : undefined;
        return {
            id: model.id,
            name: model.name,
            email: model.email,
            phone: model.phone,
            password: model.password,
            status: model.status,
            operationType: model.operationType,
            averageTicket: model.averageTicket,
            cpf: model.cpf,
            cnpj: model.cnpj,
            corporateName: model.corporateName,
            salesPageLink: model.salesPageLink,
            address,
            documents,
            wallet,
            publicKey: model.publicKey,
            secretKey: model.secretKey,
            fixedFee: model.fixedFee,
            percentageFee: model.percentageFee,
            notes: (_a = model.notes) !== null && _a !== void 0 ? _a : undefined,
        };
    }
    async getUsers(params = {}) {
        var _a, _b;
        const page = Math.max((_a = params.page) !== null && _a !== void 0 ? _a : 1, 1);
        const limit = Math.max((_b = params.limit) !== null && _b !== void 0 ? _b : 10, 1);
        const skip = (page - 1) * limit;
        const where = {};
        if (params.status) {
            const normalizedStatus = params.status.toLowerCase();
            if (!VALID_STATUSES.includes(normalizedStatus)) {
                throw new common_1.ConflictException('Status inválido. Use: pending, approved, rejected');
            }
            where.status = normalizedStatus;
        }
        if (params.search) {
            const trimmedSearch = params.search.trim();
            if (trimmedSearch) {
                where.OR = [
                    { name: { contains: trimmedSearch, mode: 'insensitive' } },
                    { email: { contains: trimmedSearch, mode: 'insensitive' } },
                    { cpf: { contains: trimmedSearch, mode: 'insensitive' } },
                    { cnpj: { contains: trimmedSearch, mode: 'insensitive' } },
                ];
            }
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            users: users.map(user => this.toDomain(user)),
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map