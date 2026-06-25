export type UserRole = 'client' | 'provider' | 'admin';
export type UserStatus = 'active' | 'blocked';
export type ProviderStatus = 'pending' | 'approved' | 'blocked';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  state: string;
  status: UserStatus;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface RegisterClientData {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  state: string;
}

export interface RegisterProviderData {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  state: string;
  professionalName: string;
  document: string;
  bio: string;
  categories: string[];
  cities: string[];
  neighborhoods: string[];
}

// ── Etapa 3B ─────────────────────────────────────────────────────────────────

export type Urgency = 'low' | 'medium' | 'high';

export type ServiceRequestStatus =
  | 'open'
  | 'quoted'
  | 'scheduled'
  | 'in_progress'
  | 'waiting_approval'
  | 'completed'
  | 'cancelled'
  | 'dispute';

export type QuoteStatus = 'sent' | 'accepted' | 'rejected' | 'expired';

export type OrderStatus =
  | 'created'
  | 'scheduled'
  | 'in_progress'
  | 'waiting_approval'
  | 'completed'
  | 'cancelled';

export interface ServiceRequest {
  _id: string;
  clientId: string;
  categoryId: string | Category;
  city: string;
  neighborhood: string;
  approximateAddress: string;
  fullAddress?: string;
  description: string;
  photos: string[];
  desiredDate: string | null;
  urgency: Urgency;
  status: ServiceRequestStatus;
  selectedProviderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  _id: string;
  serviceRequestId: string | ServiceRequest;
  providerId: string | { _id: string; name: string; city: string };
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  description: string;
  estimatedTime: string;
  warrantyDays: number;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  serviceRequestId: string | ServiceRequest;
  quoteId: string | Quote;
  clientId: string | User;
  providerId: string | User;
  scheduledDate: string | null;
  status: OrderStatus;
  beforePhotos: string[];
  afterPhotos: string[];
  totalAmount?: number;
  depositAmount?: number;
  remainingAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface CreateServiceRequestData {
  categoryId: string;
  city: string;
  neighborhood?: string;
  approximateAddress?: string;
  fullAddress?: string;
  description: string;
  urgency?: Urgency;
  desiredDate?: string;
  desiredDateEnd?: string;
  budget?: number;
}

export interface ProviderSearchResult {
  _id: string;
  userId: { _id: string; name: string; email: string; city: string; state: string };
  professionalName: string;
  bio: string;
  categories: Category[];
  cities: string[];
  status: ProviderStatus;
  plan: string;
  averageRating: number;
  reviewCount: number;
  completedServices: number;
}

export interface CreateQuoteData {
  serviceRequestId: string;
  totalAmount: number;
  description?: string;
  estimatedTime?: string;
  warrantyDays?: number;
}
