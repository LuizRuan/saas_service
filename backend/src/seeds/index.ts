import '../config/env';
import { connectDatabase } from '../config/database';
import { seedAdmin } from './adminSeeder';
import { seedCategories } from './categorySeeder';

async function run(): Promise<void> {
  await connectDatabase();
  console.log('🌱 Executando seeds...');
  await seedAdmin();
  await seedCategories();
  console.log('✅ Seeds concluídos');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Erro nos seeds:', err);
  process.exit(1);
});
