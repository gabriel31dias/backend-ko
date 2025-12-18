export interface Webhook {
  id: string;
  userId: string;
  url: string;
  description?: string;
  // Eventos habilitados
  eventPaymentCreated: boolean;
  eventPaymentCompleted: boolean;
  eventWithdrawCompleted: boolean;
  eventRefund: boolean;
  // Status e configurações
  isActive: boolean;
  secretKey?: string;
  maxRetries: number;
  timeoutSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: 'payment_created' | 'payment_completed' | 'withdraw_completed' | 'refund';
  payload: any;
  responseCode?: number;
  responseBody?: string;
  success: boolean;
  attempts: number;
  lastAttempt?: Date;
  nextRetry?: Date;
  createdAt: Date;
}

export interface WebhookEvent {
  eventType: 'payment_created' | 'payment_completed' | 'withdraw_completed' | 'refund';
  data: any;
  userId: string;
  timestamp: Date;
}