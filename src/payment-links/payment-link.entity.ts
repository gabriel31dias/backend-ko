export interface PaymentLinkTheme {
  brandColor: string;
  accentColor: string;
  backgroundImage?: string;
}

export interface PaymentLink {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  requireEmail: boolean;
  requirePhone: boolean;
  allowCustomAmount: boolean;
  maxUses?: number;
  uses: number;
  status: 'active' | 'expired';
  createdAt: string;
  expiresAt?: string;
  slug: string;
  shareUrl: string;
  theme: PaymentLinkTheme;
}

export interface PaymentResult {
  paymentMethod: 'card' | 'pix';
  status: 'confirmed' | 'pending';
  transactionId: string;
  issuedAt: string;
  pixCode?: string;
  qrCodeUrl?: string;
  expiresAt?: string;
}
