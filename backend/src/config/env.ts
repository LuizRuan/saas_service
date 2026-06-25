import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3333', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  USE_MEMORY_DB: process.env.USE_MEMORY_DB === 'true',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@maocerta.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '123456',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Administrador MãoCerta',
  UPLOAD_PROVIDER: process.env.UPLOAD_PROVIDER || 'local',
  UPLOAD_MAX_SIZE_MB: parseInt(process.env.UPLOAD_MAX_SIZE_MB || '10', 10),
  PLATFORM_FEE_PERCENT: parseFloat(process.env.PLATFORM_FEE_PERCENT || '10'),
  DEPOSIT_PERCENT: parseFloat(process.env.DEPOSIT_PERCENT || '20'),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
