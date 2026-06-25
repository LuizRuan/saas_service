import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { ProviderProfile } from '../models/ProviderProfile';
import { env } from '../config/env';

const CATEGORIES = [
  { name: 'Pintor', slug: 'pintor', description: 'Serviços de pintura residencial e comercial' },
  { name: 'Eletricista', slug: 'eletricista', description: 'Instalações e reparos elétricos' },
  { name: 'Encanador', slug: 'encanador', description: 'Serviços de encanamento e hidráulica' },
  {
    name: 'Técnico de Ar-condicionado',
    slug: 'tecnico-ar-condicionado',
    description: 'Instalação, manutenção e limpeza de ar-condicionado',
  },
  {
    name: 'Técnico de Câmeras/Segurança',
    slug: 'tecnico-cameras-seguranca',
    description: 'Instalação e manutenção de câmeras e sistemas de segurança',
  },
  {
    name: 'Montador de Móveis',
    slug: 'montador-de-moveis',
    description: 'Montagem e desmontagem de móveis',
  },
];

export async function runSeed(): Promise<void> {
  // --- Seed de categorias ---
  console.log('\n📦 Criando categorias...');
  for (const cat of CATEGORIES) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) {
      await Category.create(cat);
      console.log(`  ✅ Categoria criada: ${cat.name}`);
    } else {
      console.log(`  ⏭️  Categoria já existe: ${cat.name}`);
    }
  }

  // --- Seed do admin ---
  const adminEmail = env.ADMIN_EMAIL;
  const adminPassword = env.ADMIN_PASSWORD;
  const adminName = env.ADMIN_NAME;

  console.log('\n👤 Criando usuário admin...');
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await User.create({ name: adminName, email: adminEmail, passwordHash, role: 'admin', status: 'active' });
    console.log(`  ✅ Admin criado: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`  ⏭️  Admin já existe: ${adminEmail}`);
  }

  // --- Seeds demo (apenas em ambiente de desenvolvimento/memória) ---
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    await seedDemoUsers();
  }

  console.log('\n🎉 Seed concluído com sucesso!\n');
}

async function seedDemoUsers(): Promise<void> {
  const demoPassword = await bcrypt.hash('123456', 12);

  // Cliente demo
  console.log('\n👤 Criando cliente demo...');
  const clientEmail = 'cliente@maocerta.com';
  const existingClient = await User.findOne({ email: clientEmail });
  if (!existingClient) {
    await User.create({
      name: 'Maria Cliente',
      email: clientEmail,
      passwordHash: demoPassword,
      role: 'client',
      status: 'active',
      phone: '(11) 91111-1111',
      city: 'São Paulo',
      state: 'SP',
    });
    console.log(`  ✅ Cliente demo criado: ${clientEmail} / 123456`);
  } else {
    console.log(`  ⏭️  Cliente demo já existe: ${clientEmail}`);
  }

  // Prestador demo
  console.log('\n🔧 Criando prestador demo...');
  const providerEmail = 'prestador@maocerta.com';
  const existingProvider = await User.findOne({ email: providerEmail });

  if (!existingProvider) {
    const providerUser = await User.create({
      name: 'João Prestador',
      email: providerEmail,
      passwordHash: demoPassword,
      role: 'provider',
      status: 'active',
      phone: '(11) 92222-2222',
      city: 'São Paulo',
      state: 'SP',
    });

    // Busca todas as categorias para atribuir ao prestador
    const allCategories = await Category.find({ active: true });

    await ProviderProfile.create({
      userId: providerUser._id,
      professionalName: 'João Prestador',
      bio: 'Profissional experiente com mais de 10 anos de experiência. Prestador demo para testes.',
      document: '123.456.789-00',
      categories: allCategories.map(c => c._id),
      cities: ['São Paulo', 'Guarulhos', 'Santo André'],
      neighborhoods: ['Centro', 'Moema', 'Vila Mariana', 'Itaim Bibi'],
      status: 'approved',
      plan: 'free',
      verified: false,
    });

    console.log(`  ✅ Prestador demo criado: ${providerEmail} / 123456 (aprovado)`);
  } else {
    console.log(`  ⏭️  Prestador demo já existe: ${providerEmail}`);
  }
}

// Executar diretamente via CLI: npm run seed
if (require.main === module) {
  (async () => {
    const dotenv = await import('dotenv');
    dotenv.config();

    const mongoose = await import('mongoose');
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.includes('<user>') || mongoUri.includes('<password>')) {
      console.error('❌ MONGODB_URI não configurada. Configure o .env para rodar o seed standalone.');
      console.log('💡 Dica: rode npm run dev:memory — o seed roda automaticamente com banco em memória.');
      process.exit(1);
    }

    await mongoose.default.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');

    await runSeed();

    await mongoose.default.disconnect();
    console.log('🔌 Desconectado do MongoDB');
    process.exit(0);
  })().catch((err) => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  });
}
