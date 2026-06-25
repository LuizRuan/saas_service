import mongoose from 'mongoose';
import { env } from './env';

let mongoServer: any = null;

function shouldUseMemoryDb(): boolean {
  if (env.USE_MEMORY_DB) return true;
  if (env.NODE_ENV === 'test') return true;
  if (!env.MONGODB_URI) return true;
  if (env.MONGODB_URI.includes('<user>') || env.MONGODB_URI.includes('<password>')) return true;
  return false;
}

export async function connectDatabase(): Promise<void> {
  try {
    let uri: string;

    if (shouldUseMemoryDb()) {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('🧪 MongoDB em memória iniciado (desenvolvimento local)');
    } else {
      uri = env.MONGODB_URI;
      console.log('☁️  Conectando ao MongoDB Atlas...');
    }

    await mongoose.connect(uri);

    if (shouldUseMemoryDb()) {
      console.log('✅ MongoDB em memória pronto');
    } else {
      console.log('✅ MongoDB Atlas conectado');
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('❌ Erro na conexão MongoDB:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB desconectado');
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}
