export interface WalletSnapshot {
    balance: number;
    valorReceber: number;
    grossBalance: number;
    currency: string;
}
export interface AddressSnapshot {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
}
export interface PfDocumentsSnapshot {
    documentFront?: string;
    documentBack?: string;
    selfieWithDocument?: string;
    bankProof?: string;
}
export interface PjDocumentsSnapshot {
    legalRepresentativeDocumentFront?: string;
    legalRepresentativeDocumentBack?: string;
    legalRepresentativeSelfie?: string;
    bankProof?: string;
    cnpjDocument?: string;
}
export interface DocumentsSnapshot {
    name?: string;
    cpf?: string;
    pf?: PfDocumentsSnapshot;
    pj?: PjDocumentsSnapshot;
}
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    password: string;
    operationType?: string;
    averageTicket?: number;
    cpf?: string;
    cnpj?: string;
    corporateName?: string;
    salesPageLink?: string;
    address?: AddressSnapshot;
    documents?: DocumentsSnapshot;
    wallet: WalletSnapshot;
    publicKey?: string;
    secretKey?: string;
    fixedFee?: number;
    percentageFee?: number;
}
//# sourceMappingURL=user.entity.d.ts.map