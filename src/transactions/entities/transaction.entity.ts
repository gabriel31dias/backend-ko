export interface TransactionItem {
  name: string;
  price: number;
  quantity?: number;
  description?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  paymentMethod: 'pix' | 'card';
  status: 'pending' | 'waiting' | 'approved' | 'rejected';
  transactionId: string;
  description?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerDocument?: string;
  customerType: 'pf' | 'pj';
  customerTaxId: string;
  // Endereço do cliente
  customerStreet: string;
  customerNumber: string;
  customerComplement?: string;
  customerNeighborhood: string;
  customerCity: string;
  customerState: string;
  customerZipCode: string;
  receiverUserId: string;
  createdAt: Date;
  approvedAt?: Date;
  // PIX específico
  pixCode?: string;
  pixQrCode?: string;
  pixExpiresAt?: Date;
  // Cartão específico
  authorizationCode?: string;
  nsu?: string;
  // Taxas aplicadas
  grossAmount?: number;
  fixedFeeApplied?: number;
  percentageFeeApplied?: number;
  totalFeesApplied?: number;
  netAmount?: number;
  // Items da transação
  items?: TransactionItem[];
}

export interface TransactionResponse {
  success: boolean;
  transaction: Transaction;
  // PIX específico
  pixCode?: string;
  pixQrCode?: string;
  pixExpiresAt?: Date;
  // Mensagens
  message?: string;
  error?: string;
}