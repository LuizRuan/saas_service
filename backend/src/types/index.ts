export type UserRole = 'client' | 'provider' | 'admin';
export type UserStatus = 'active' | 'blocked';
export type ProviderStatus = 'pending' | 'approved' | 'blocked';
export type ProviderPlan = 'free' | 'pro' | 'business' | 'premium';
export type ServiceRequestStatus =
  | 'open'
  | 'quoted'
  | 'scheduled'
  | 'in_progress'
  | 'waiting_approval'
  | 'completed'
  | 'cancelled'
  | 'dispute';
export type ServiceRequestUrgency = 'low' | 'medium' | 'high';
export type QuoteStatus = 'sent' | 'accepted' | 'rejected' | 'expired';
export type OrderStatus =
  | 'pending_payment'
  | 'scheduled'
  | 'in_progress'
  | 'waiting_approval'
  | 'completed'
  | 'cancelled'
  | 'dispute';
export type PaymentType = 'deposit' | 'remaining' | 'full';
export type PaymentGateway = 'simulated' | 'mercado_pago' | 'asaas' | 'pagarme';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_client'
  | 'resolved_provider'
  | 'refunded';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
