export class DocumentInfo {
  type: string;
  name: string;
  path?: string;
  status: 'available' | 'missing' | 'rejected';
}

export class UserInfo {
  id: string;
  name: string;
  email: string;
  status: string;
  lastUpdate: Date;
}

export class DocumentSummary {
  total: number;
  available: number;
  missing: number;
  rejected: number;
}

export class RejectedDocumentsResponseDto {
  user: UserInfo;
  isRejected: boolean;
  rejectionNotes: string | null;
  rejectedDocuments: DocumentInfo[];
  missingDocuments: DocumentInfo[];
  availableDocuments: DocumentInfo[];
  summary: DocumentSummary;
  documentsUrls: {
    pfDocumentFront: string | null;
    pfDocumentBack: string | null;
    pfSelfieDocument: string | null;
    pfBankProof: string | null;
    pjLegalRepresentativeDocumentFront: string | null;
    pjLegalRepresentativeDocumentBack: string | null;
    pjSelfieDocument: string | null;
    pjBankProof: string | null;
    pjCnpjDocument: string | null;
  };
}