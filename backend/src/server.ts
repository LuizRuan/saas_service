import './config/env';
import app from './app';
import { connectDatabase } from './config/database';
import { seedAdmin } from './seeds/adminSeeder';
import { seedCategories } from './seeds/categorySeeder';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  await seedAdmin();
  await seedCategories();

  app.listen(env.port, () => {
    console.log(`🚀 Servidor rodando na porta ${env.port} [${env.nodeEnv}]`);
    console.log(`📡 API: http://localhost:${env.port}/api`);
    console.log(`❤️  Health: http://localhost:${env.port}/health`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Falha ao iniciar o servidor:', err);
  process.exit(1);
});
