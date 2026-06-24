import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  console.log('✅ MongoDB conectado com sucesso');

  mongoose.connection.on('error', (err) => {
    console.error('❌ Erro na conexão MongoDB:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB desconectado');
  });
}
