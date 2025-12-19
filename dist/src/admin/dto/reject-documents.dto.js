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
exports.RejectDocumentsDto = exports.UserDocumentRejection = exports.DocumentType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var DocumentType;
(function (DocumentType) {
    DocumentType["PF_DOCUMENT_FRONT"] = "pfDocumentFront";
    DocumentType["PF_DOCUMENT_BACK"] = "pfDocumentBack";
    DocumentType["PF_SELFIE_DOCUMENT"] = "pfSelfieDocument";
    DocumentType["PF_BANK_PROOF"] = "pfBankProof";
    DocumentType["PJ_LEGAL_REP_DOCUMENT_FRONT"] = "pjLegalRepresentativeDocumentFront";
    DocumentType["PJ_LEGAL_REP_DOCUMENT_BACK"] = "pjLegalRepresentativeDocumentBack";
    DocumentType["PJ_SELFIE_DOCUMENT"] = "pjSelfieDocument";
    DocumentType["PJ_BANK_PROOF"] = "pjBankProof";
    DocumentType["PJ_CNPJ_DOCUMENT"] = "pjCnpjDocument";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
class UserDocumentRejection {
}
exports.UserDocumentRejection = UserDocumentRejection;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserDocumentRejection.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsEnum)(DocumentType, { each: true }),
    __metadata("design:type", Array)
], UserDocumentRejection.prototype, "rejectedDocuments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserDocumentRejection.prototype, "reason", void 0);
class RejectDocumentsDto {
}
exports.RejectDocumentsDto = RejectDocumentsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => UserDocumentRejection),
    __metadata("design:type", Array)
], RejectDocumentsDto.prototype, "users", void 0);
//# sourceMappingURL=reject-documents.dto.js.map