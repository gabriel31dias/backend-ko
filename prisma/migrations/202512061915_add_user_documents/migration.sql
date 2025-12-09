-- Add document upload-related columns for PF and PJ data plus corporate name
ALTER TABLE "User"
  ADD COLUMN "corporateName" TEXT,
  ADD COLUMN "pfDocumentFrontPath" TEXT,
  ADD COLUMN "pfDocumentBackPath" TEXT,
  ADD COLUMN "pfSelfieDocumentPath" TEXT,
  ADD COLUMN "pfBankProofPath" TEXT,
  ADD COLUMN "legalRepresentativeDocumentFrontPath" TEXT,
  ADD COLUMN "legalRepresentativeDocumentBackPath" TEXT,
  ADD COLUMN "legalRepresentativeSelfiePath" TEXT,
  ADD COLUMN "pjBankProofPath" TEXT,
  ADD COLUMN "cnpjDocumentPath" TEXT;
