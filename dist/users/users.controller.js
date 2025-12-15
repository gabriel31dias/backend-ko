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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs_1 = require("fs");
const path_1 = require("path");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_fees_dto_1 = require("./dto/update-fees.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const approval_notes_dto_1 = require("./dto/approval-notes.dto");
const reject_user_dto_1 = require("./dto/reject-user.dto");
const users_service_1 = require("./users.service");
const public_decorator_1 = require("../auth/public.decorator");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async createUser(payload, files, req) {
        const documentPaths = this.extractDocumentPaths(files || {});
        const user = await this.usersService.createUser(payload, documentPaths);
        return this.toResponse(user, req);
    }
    async updateFees(id, updateFeesDto, req) {
        const user = await this.usersService.updateFees(id, updateFeesDto);
        return this.toResponse(user, req);
    }
    async getPendingSellers(page, limit, req) {
        const pageNum = parseInt(page || '1');
        const limitNum = parseInt(limit || '10');
        const result = await this.usersService.getPendingSellers(pageNum, limitNum);
        return {
            sellers: result.sellers.map(user => this.toResponse(user, req)),
            pagination: result.pagination,
        };
    }
    async getUsers(req, page, limit, status, search) {
        const parsedPage = parseInt(page !== null && page !== void 0 ? page : '1', 10);
        const parsedLimit = parseInt(limit !== null && limit !== void 0 ? limit : '10', 10);
        const pageNum = Number.isNaN(parsedPage) ? 1 : Math.max(parsedPage, 1);
        const limitNum = Number.isNaN(parsedLimit) ? 10 : Math.max(parsedLimit, 1);
        const result = await this.usersService.getUsers({ page: pageNum, limit: limitNum, status, search });
        return {
            users: result.users.map(user => this.toResponse(user, req)),
            pagination: result.pagination,
        };
    }
    async getUserById(id, req) {
        const user = await this.usersService.findById(id);
        return this.toResponse(user, req);
    }
    async updateUser(id, updateStatusDto, req) {
        const user = await this.usersService.updateStatus(id, updateStatusDto.status, { notes: updateStatusDto.notes });
        return this.toResponse(user, req);
    }
    async approveUser(id, approvalNotesDto, req) {
        const user = await this.usersService.updateStatus(id, 'approved', { notes: approvalNotesDto === null || approvalNotesDto === void 0 ? void 0 : approvalNotesDto.notes });
        return this.toResponse(user, req);
    }
    async rejectUser(id, rejectUserDto, req) {
        const user = await this.usersService.updateStatus(id, 'rejected', { notes: rejectUserDto.notes });
        return this.toResponse(user, req);
    }
    async updateStatus(id, body, req) {
        const user = await this.usersService.updateStatus(id, body.status, { notes: body.notes });
        return this.toResponse(user, req);
    }
    extractDocumentPaths(files) {
        return {
            pfDocumentFront: this.resolveFilePath(files.pfDocumentFront),
            pfDocumentBack: this.resolveFilePath(files.pfDocumentBack),
            pfSelfieDocument: this.resolveFilePath(files.pfSelfieDocument),
            pfBankProof: this.resolveFilePath(files.pfBankProof),
            pjLegalRepresentativeDocumentFront: this.resolveFilePath(files.pjLegalRepresentativeDocumentFront),
            pjLegalRepresentativeDocumentBack: this.resolveFilePath(files.pjLegalRepresentativeDocumentBack),
            pjSelfieDocument: this.resolveFilePath(files.pjSelfieDocument),
            pjBankProof: this.resolveFilePath(files.pjBankProof),
            pjCnpjDocument: this.resolveFilePath(files.pjCnpjDocument),
        };
    }
    resolveFilePath(fileArray) {
        const file = fileArray === null || fileArray === void 0 ? void 0 : fileArray[0];
        if (!file) {
            return undefined;
        }
        if (file.path) {
            const relativePath = (0, path_1.relative)(process.cwd(), file.path);
            return relativePath || file.path;
        }
        return (0, path_1.join)('uploads', 'users', file.filename);
    }
    toResponse(user, req) {
        const { password } = user, rest = __rest(user, ["password"]);
        return Object.assign(Object.assign({}, rest), { documents: this.buildDocumentsResponse(user.documents, req), documentFiles: this.buildDocumentFiles(user.documents, req), publicKey: user.publicKey, secretKey: user.secretKey });
    }
    buildDocumentsResponse(documents, req) {
        if (!documents) {
            return undefined;
        }
        const pf = documents.pf
            ? Object.assign(Object.assign({}, documents.pf), { documentFront: this.buildFileUrl(documents.pf.documentFront, req), documentBack: this.buildFileUrl(documents.pf.documentBack, req), selfieWithDocument: this.buildFileUrl(documents.pf.selfieWithDocument, req), bankProof: this.buildFileUrl(documents.pf.bankProof, req) }) : undefined;
        const pj = documents.pj
            ? Object.assign(Object.assign({}, documents.pj), { legalRepresentativeDocumentFront: this.buildFileUrl(documents.pj.legalRepresentativeDocumentFront, req), legalRepresentativeDocumentBack: this.buildFileUrl(documents.pj.legalRepresentativeDocumentBack, req), legalRepresentativeSelfie: this.buildFileUrl(documents.pj.legalRepresentativeSelfie, req), bankProof: this.buildFileUrl(documents.pj.bankProof, req), cnpjDocument: this.buildFileUrl(documents.pj.cnpjDocument, req) }) : undefined;
        return Object.assign(Object.assign({}, documents), { pf,
            pj });
    }
    buildFileUrl(filePath, req) {
        if (!filePath) {
            return undefined;
        }
        if (/^https?:\/\//i.test(filePath)) {
            return filePath;
        }
        const sanitizedPath = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
        const baseUrl = this.getBaseUrl(req);
        return `${baseUrl}/${sanitizedPath}`;
    }
    getBaseUrl(req) {
        const configuredBase = process.env.FILE_BASE_URL || process.env.APP_URL;
        if (configuredBase) {
            return configuredBase.replace(/\/+$/, '');
        }
        if (req) {
            const protocol = req.protocol;
            const host = req.get('host');
            if (host) {
                return `${protocol}://${host}`.replace(/\/+$/, '');
            }
        }
        const port = process.env.PORT || '3000';
        return `http://localhost:${port}`.replace(/\/+$/, '');
    }
    buildDocumentFiles(documents, req) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        return {
            pfDocumentFront: (_b = this.buildFileUrl((_a = documents === null || documents === void 0 ? void 0 : documents.pf) === null || _a === void 0 ? void 0 : _a.documentFront, req)) !== null && _b !== void 0 ? _b : null,
            pfDocumentBack: (_d = this.buildFileUrl((_c = documents === null || documents === void 0 ? void 0 : documents.pf) === null || _c === void 0 ? void 0 : _c.documentBack, req)) !== null && _d !== void 0 ? _d : null,
            pfSelfieDocument: (_f = this.buildFileUrl((_e = documents === null || documents === void 0 ? void 0 : documents.pf) === null || _e === void 0 ? void 0 : _e.selfieWithDocument, req)) !== null && _f !== void 0 ? _f : null,
            pfBankProof: (_h = this.buildFileUrl((_g = documents === null || documents === void 0 ? void 0 : documents.pf) === null || _g === void 0 ? void 0 : _g.bankProof, req)) !== null && _h !== void 0 ? _h : null,
            pjLegalRepresentativeDocumentFront: (_k = this.buildFileUrl((_j = documents === null || documents === void 0 ? void 0 : documents.pj) === null || _j === void 0 ? void 0 : _j.legalRepresentativeDocumentFront, req)) !== null && _k !== void 0 ? _k : null,
            pjLegalRepresentativeDocumentBack: (_m = this.buildFileUrl((_l = documents === null || documents === void 0 ? void 0 : documents.pj) === null || _l === void 0 ? void 0 : _l.legalRepresentativeDocumentBack, req)) !== null && _m !== void 0 ? _m : null,
            pjSelfieDocument: (_p = this.buildFileUrl((_o = documents === null || documents === void 0 ? void 0 : documents.pj) === null || _o === void 0 ? void 0 : _o.legalRepresentativeSelfie, req)) !== null && _p !== void 0 ? _p : null,
            pjBankProof: (_r = this.buildFileUrl((_q = documents === null || documents === void 0 ? void 0 : documents.pj) === null || _q === void 0 ? void 0 : _q.bankProof, req)) !== null && _r !== void 0 ? _r : null,
            pjCnpjDocument: (_t = this.buildFileUrl((_s = documents === null || documents === void 0 ? void 0 : documents.pj) === null || _s === void 0 ? void 0 : _s.cnpjDocument, req)) !== null && _t !== void 0 ? _t : null,
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'pfDocumentFront', maxCount: 1 },
        { name: 'pfDocumentBack', maxCount: 1 },
        { name: 'pfSelfieDocument', maxCount: 1 },
        { name: 'pfBankProof', maxCount: 1 },
        { name: 'pjLegalRepresentativeDocumentFront', maxCount: 1 },
        { name: 'pjLegalRepresentativeDocumentBack', maxCount: 1 },
        { name: 'pjSelfieDocument', maxCount: 1 },
        { name: 'pjBankProof', maxCount: 1 },
        { name: 'pjCnpjDocument', maxCount: 1 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                ensureUploadDir();
                cb(null, USER_UPLOAD_DIR);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const extension = (0, path_1.extname)(file.originalname) || '';
                cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (isAllowedFile(file.mimetype)) {
                return cb(null, true);
            }
            cb(new common_1.UnsupportedMediaTypeException('Apenas imagens ou PDF são permitidos nos documentos.'), false);
        },
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)(':id/fees'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_fees_dto_1.UpdateFeesDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateFees", null);
__decorate([
    (0, common_1.Get)('sellers/pending'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPendingSellers", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approval_notes_dto_1.ApprovalNotesDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "approveUser", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reject_user_dto_1.RejectUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "rejectUser", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateStatus", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
const USER_UPLOAD_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'users');
function ensureUploadDir() {
    if (!(0, fs_1.existsSync)(USER_UPLOAD_DIR)) {
        (0, fs_1.mkdirSync)(USER_UPLOAD_DIR, { recursive: true });
    }
}
function isAllowedFile(mimetype) {
    if (!mimetype) {
        return false;
    }
    return mimetype.startsWith('image/') || mimetype === 'application/pdf';
}
//# sourceMappingURL=users.controller.js.map