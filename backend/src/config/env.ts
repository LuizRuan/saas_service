import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

// Variáveis críticas obrigatórias em todos os ambientes
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET é obrigatório — defina em .env');
if (!process.env.REFRESH_TOKEN_SECRET) throw new Error('REFRESH_TOKEN_SECRET é obrigatório — defina em .env');
if (nodeEnv === 'production') {
  if (!process.env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD é obrigatório em produção');
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI é obrigatório em produção');
}

export const env = {
  PORT: parseInt(process.env.PORT || '3333', 10),
  NODE_ENV: nodeEnv,
  MONGODB_URI: process.env.MONGODB_URI || '',
  USE_MEMORY_DB: process.env.USE_MEMORY_DB === 'true',
  SEED_DEMO_DATA: process.env.SEED_DEMO_DATA === 'true',
  JWT_SECRET: process.env.JWT_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@maocerta.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Administrador MãoCerta',
  UPLOAD_PROVIDER: process.env.UPLOAD_PROVIDER || 'local',
  UPLOAD_MAX_SIZE_MB: parseInt(process.env.UPLOAD_MAX_SIZE_MB || '10', 10),
  PLATFORM_FEE_PERCENT: parseFloat(process.env.PLATFORM_FEE_PERCENT || '10'),
  DEPOSIT_PERCENT: parseFloat(process.env.DEPOSIT_PERCENT || '20'),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@maocerta.com',
  APP_URL: process.env.APP_URL || 'http://localhost:5173',
};
