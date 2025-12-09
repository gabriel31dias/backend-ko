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
const users_service_1 = require("./users.service");
const public_decorator_1 = require("../auth/public.decorator");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async createUser(payload, files) {
        const documentPaths = this.extractDocumentPaths(files || {});
        const user = await this.usersService.createUser(payload, documentPaths);
        return this.toResponse(user);
    }
    async updateFees(id, updateFeesDto) {
        const user = await this.usersService.updateFees(id, updateFeesDto);
        return this.toResponse(user);
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
    toResponse(user) {
        const { password } = user, rest = __rest(user, ["password"]);
        return Object.assign(Object.assign({}, rest), { publicKey: user.publicKey, secretKey: user.secretKey });
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)(':id/fees'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_fees_dto_1.UpdateFeesDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateFees", null);
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