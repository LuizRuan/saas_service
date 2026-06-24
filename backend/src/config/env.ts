import dotenv from 'dotenv';
dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET'] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  mongodbUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@maocerta.com.br',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'Admin@123456',
  adminName: process.env.ADMIN_NAME ?? 'Administrador MãoCerta',
  platformCommissionPercent: parseFloat(process.env.PLATFORM_COMMISSION_PERCENT ?? '10'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
};
