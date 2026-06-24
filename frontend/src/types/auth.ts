export type UserRole = 'client' | 'provider' | 'admin';
export type UserStatus = 'active' | 'blocked';
export type ProviderStatus = 'pending' | 'approved' | 'blocked';
export type ProviderPlan = 'free' | 'pro' | 'business' | 'premium';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  city?: string;
  state?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderProfile {
  _id: string;
  userId: string;
  professionalName: string;
  bio?: string;
  document?: string;
  categories: string[];
  cities: string[];
  neighborhoods: string[];
  profileImage?: string;
  portfolioImages: string[];
  averageRating: number;
  totalReviews: number;
  completedServices: number;
  status: ProviderStatus;
  plan: ProviderPlan;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterClientInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  state?: string;
}

export interface RegisterProviderInput extends RegisterClientInput {
  professionalName: string;
  bio?: string;
  document?: string;
  cities?: string[];
}

export interface LoginInput {
  email: string;
  password: string;
}
