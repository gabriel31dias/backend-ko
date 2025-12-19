export declare enum DocumentType {
    PF_DOCUMENT_FRONT = "pfDocumentFront",
    PF_DOCUMENT_BACK = "pfDocumentBack",
    PF_SELFIE_DOCUMENT = "pfSelfieDocument",
    PF_BANK_PROOF = "pfBankProof",
    PJ_LEGAL_REP_DOCUMENT_FRONT = "pjLegalRepresentativeDocumentFront",
    PJ_LEGAL_REP_DOCUMENT_BACK = "pjLegalRepresentativeDocumentBack",
    PJ_SELFIE_DOCUMENT = "pjSelfieDocument",
    PJ_BANK_PROOF = "pjBankProof",
    PJ_CNPJ_DOCUMENT = "pjCnpjDocument"
}
export declare class UserDocumentRejection {
    userId: string;
    rejectedDocuments: DocumentType[];
    reason?: string;
}
export declare class RejectDocumentsDto {
    users: UserDocumentRejection[];
}
//# sourceMappingURL=reject-documents.dto.d.ts.map