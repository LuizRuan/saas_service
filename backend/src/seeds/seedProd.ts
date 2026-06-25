/**
 * Seed de produção — apenas categorias e usuário admin.
 * NÃO insere dados demo com senhas públicas.
 *
 * Uso: npm run seed:prod
 */
import { env } from '../config/env';
import { runSeed } from './seed';

(async () => {
  const dotenv = await import('dotenv');
  dotenv.config();

  // Força NODE_ENV como production para que o seed demo seja bloqueado
  (process.env as any).NODE_ENV = 'production';

  const mongoose = await import('mongoose');
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.includes('<user>') || mongoUri.includes('<password>')) {
    console.error('❌ MONGODB_URI não configurada. Configure o .env de produção.');
    process.exit(1);
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.error('❌ ADMIN_PASSWORD não configurada. Configure o .env de produção.');
    process.exit(1);
  }

  await mongoose.default.connect(mongoUri);
  console.log('✅ Conectado ao MongoDB');

  await runSeed();

  await mongoose.default.disconnect();
  console.log('🔌 Desconectado do MongoDB');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Erro no seed de produção:', err);
  process.exit(1);
});
