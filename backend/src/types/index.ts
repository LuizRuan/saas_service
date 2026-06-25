import { Request } from 'express';

// Roles do sistema
export type UserRole = 'client' | 'provider' | 'admin';

// Status do usuário
export type UserStatus = 'active' | 'blocked';

// Status do prestador
export type ProviderStatus = 'pending' | 'approved' | 'blocked';

// Plano do prestador
export type ProviderPlan = 'free' | 'pro' | 'business' | 'premium';

// Urgência
export type Urgency = 'low' | 'medium' | 'high';

// Status da solicitação
export type ServiceRequestStatus =
  | 'open'
  | 'quoted'
  | 'scheduled'
  | 'in_progress'
  | 'waiting_approval'
  | 'completed'
  | 'cancelled'
  | 'dispute';

// Status do orçamento
export type QuoteStatus = 'sent' | 'accepted' | 'rejected' | 'expired';

// Status da ordem
export type OrderStatus =
  | 'created'
  | 'scheduled'
  | 'in_progress'
  | 'waiting_approval'
  | 'completed'
  | 'cancelled';

// Tipo de pagamento
export type PaymentType = 'deposit' | 'remaining' | 'full';

// Gateway de pagamento
export type PaymentGateway = 'simulated' | 'mercado_pago' | 'asaas' | 'pagarme';

// Status do pagamento
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// Status da disputa
export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_client'
  | 'resolved_provider'
  | 'refunded';

// Interface do payload JWT
export interface JwtPayload {
  userId: string;
  role: UserRole;
}

// Request autenticado
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Resposta padrão da API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}
