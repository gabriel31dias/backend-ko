import { IsArray, IsString, IsOptional, ArrayMinSize, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum DocumentType {
  PF_DOCUMENT_FRONT = 'pfDocumentFront',
  PF_DOCUMENT_BACK = 'pfDocumentBack',
  PF_SELFIE_DOCUMENT = 'pfSelfieDocument',
  PF_BANK_PROOF = 'pfBankProof',
  PJ_LEGAL_REP_DOCUMENT_FRONT = 'pjLegalRepresentativeDocumentFront',
  PJ_LEGAL_REP_DOCUMENT_BACK = 'pjLegalRepresentativeDocumentBack',
  PJ_SELFIE_DOCUMENT = 'pjSelfieDocument',
  PJ_BANK_PROOF = 'pjBankProof',
  PJ_CNPJ_DOCUMENT = 'pjCnpjDocument',
}

export class UserDocumentRejection {
  @IsString()
  userId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(DocumentType, { each: true })
  rejectedDocuments: DocumentType[];

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RejectDocumentsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UserDocumentRejection)
  users: UserDocumentRejection[];
}