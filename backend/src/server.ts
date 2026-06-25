import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { runSeed } from './seeds/seed';

async function bootstrap(): Promise<void> {
  // Conecta ao banco de dados
  await connectDatabase();

  // Roda seed automaticamente (idempotente — não duplica dados)
  await runSeed();

  // Inicia o servidor
  app.listen(env.PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║          🔧 MãoCerta API v1.0.0             ║
║                                              ║
║   Ambiente: ${env.NODE_ENV.padEnd(32)}║
║   Porta:    ${String(env.PORT).padEnd(32)}║
║   URL:      http://localhost:${String(env.PORT).padEnd(19)}║
║                                              ║
╚══════════════════════════════════════════════╝
    `);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Erro ao iniciar servidor:', err);
  process.exit(1);
});
