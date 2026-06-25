import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { ProviderProfile } from '../models/ProviderProfile';
import { ServiceRequest } from '../models/ServiceRequest';
import { Quote } from '../models/Quote';
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

const SERVICE_DESCRIPTIONS = [
  'Preciso pintar a sala e dois quartos. A sala tem aproximadamente 20m² e os quartos são menores. Paredes já foram lixadas, só falta a tinta.',
  'Chuveiro elétrico queimou e preciso trocar. Casa tem sistema monofásico 127v. Tenho o chuveiro novo em casa, só precisa instalar.',
  'Torneira da pia da cozinha vazando. Já tentei apertar mas o problema continua. Preciso de um encanador com urgência.',
  'Ar-condicionado split 12.000 BTUs precisando de limpeza e manutenção. Está com mau cheiro e rendendo menos.',
  'Quero instalar 4 câmeras externas na residência para segurança. A casa tem 2 andares e portão eletrônico.',
  'Comprei um guarda-roupa de 6 portas e preciso de alguém para montar. São 8 caixas, veio desmontado.',
  'Pintura externa da fachada de um sobrado. Tinta já foi comprada, só precisa da mão de obra e equipamentos.',
  'Quadro elétrico antigo precisando de upgrade. Casa tem 4 cômodos e o disjuntor geral fica caindo.',
  'Dois ralos entupidos no banheiro e a descarga do vaso sanitário com problema. Apartamento no 3º andar.',
  'Instalação de ar-condicionado novo 9.000 BTUs inverter. Já tenho o aparelho, precisa instalar e fazer a tubulação.',
];

const NEIGHBORHOODS = [
  'Centro', 'Vila Mariana', 'Moema', 'Itaim Bibi', 'Pinheiros',
  'Perdizes', 'Santana', 'Tatuapé', 'Lapa', 'Saúde',
];

const CITIES = ['São Paulo', 'Guarulhos', 'Santo André', 'São Bernardo do Campo', 'Osasco'];

export async function runSeed(): Promise<void> {
  // --- Seed de categorias ---
  console.log('\n📦 Criando categorias...');
  const categoryDocs = [];
  for (const cat of CATEGORIES) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) {
      const created = await Category.create(cat);
      categoryDocs.push(created);
      console.log(`  ✅ Categoria criada: ${cat.name}`);
    } else {
      categoryDocs.push(exists);
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

  // Seeds demo — criados em todos os ambientes para facilitar testes
  await seedDemoUsers(categoryDocs);

  console.log('\n🎉 Seed concluído com sucesso!\n');
}

async function seedDemoUsers(categoryDocs: any[]): Promise<void> {
  const demoPassword = await bcrypt.hash('123456', 12);

  // ── Clientes demo ──────────────────────────────────────────────────────────
  console.log('\n👤 Criando clientes demo...');
  const clients = [
    { email: 'cliente@maocerta.com', name: 'Maria Cliente', phone: '(11) 91111-1111', city: 'São Paulo', state: 'SP' },
    { email: 'joao.silva@email.com', name: 'João Silva', phone: '(11) 92222-2222', city: 'Guarulhos', state: 'SP' },
    { email: 'ana.santos@email.com', name: 'Ana Santos', phone: '(11) 93333-3333', city: 'Santo André', state: 'SP' },
  ];

  const clientDocs: any[] = [];
  for (const c of clients) {
    const existing = await User.findOne({ email: c.email });
    if (!existing) {
      const doc = await User.create({ ...c, passwordHash: demoPassword, role: 'client', status: 'active' });
      clientDocs.push(doc);
      console.log(`  ✅ Cliente criado: ${c.email}`);
    } else {
      clientDocs.push(existing);
      console.log(`  ⏭️  Cliente já existe: ${c.email}`);
    }
  }

  // ── Prestadores demo ───────────────────────────────────────────────────────
  console.log('\n🔧 Criando prestadores demo...');
  const providers = [
    {
      email: 'prestador@maocerta.com',
      name: 'João Prestador',
      phone: '(11) 94444-4444',
      city: 'São Paulo',
      state: 'SP',
      professionalName: 'João Prestador - Serviços Gerais',
      bio: 'Profissional com 10 anos de experiência em serviços residenciais e comerciais.',
      status: 'approved',
      averageRating: 4.8,
      totalReviews: 24,
      completedServices: 47,
    },
    {
      email: 'carlos.eletricista@email.com',
      name: 'Carlos Eletricista',
      phone: '(11) 95555-5555',
      city: 'São Paulo',
      state: 'SP',
      professionalName: 'Carlos - Elétrica Residencial e Comercial',
      bio: 'Eletricista certificado NR10, 8 anos de experiência.',
      status: 'approved',
      averageRating: 4.6,
      totalReviews: 18,
      completedServices: 32,
    },
    {
      email: 'pedro.pintor@email.com',
      name: 'Pedro Pintor',
      phone: '(11) 96666-6666',
      city: 'Guarulhos',
      state: 'SP',
      professionalName: 'Pedro Pinturas - Acabamento Premium',
      bio: 'Especializado em pintura residencial de alto padrão.',
      status: 'pending',
      averageRating: 0,
      totalReviews: 0,
      completedServices: 0,
    },
  ];

  const providerDocs: any[] = [];
  for (const p of providers) {
    const existing = await User.findOne({ email: p.email });
    if (!existing) {
      const user = await User.create({
        name: p.name, email: p.email, passwordHash: demoPassword,
        role: 'provider', status: 'active', phone: p.phone, city: p.city, state: p.state,
      });

      const allCats = categoryDocs.length > 0 ? categoryDocs : await Category.find({ active: true });
      await ProviderProfile.create({
        userId: user._id,
        professionalName: p.professionalName,
        bio: p.bio,
        document: `${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}`,
        categories: allCats.slice(0, 3).map((c: any) => c._id),
        cities: [p.city, 'São Paulo'],
        neighborhoods: ['Centro', 'Vila Mariana', 'Moema'],
        status: p.status as any,
        plan: 'free',
        verified: p.status === 'approved',
        averageRating: p.averageRating,
        totalReviews: p.totalReviews,
        completedServices: p.completedServices,
      });

      providerDocs.push(user);
      console.log(`  ✅ Prestador criado: ${p.email} (${p.status})`);
    } else {
      providerDocs.push(existing);
      console.log(`  ⏭️  Prestador já existe: ${p.email}`);
    }
  }

  // ── Solicitações de serviço demo ───────────────────────────────────────────
  console.log('\n📋 Criando solicitações de serviço demo...');
  const existingRequests = await ServiceRequest.countDocuments();

  if (existingRequests === 0 && clientDocs.length > 0 && categoryDocs.length > 0) {
    const urgencies: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const statuses: Array<'open' | 'quoted' | 'scheduled' | 'in_progress' | 'completed'> = [
      'open', 'open', 'open', 'quoted', 'quoted', 'open', 'open', 'scheduled', 'in_progress', 'completed',
    ];

    for (let i = 0; i < SERVICE_DESCRIPTIONS.length; i++) {
      const client = clientDocs[i % clientDocs.length];
      const category = categoryDocs[i % categoryDocs.length];
      const neighborhood = NEIGHBORHOODS[i % NEIGHBORHOODS.length];
      const city = CITIES[i % CITIES.length];

      await ServiceRequest.create({
        clientId: client._id,
        categoryId: category._id,
        city,
        neighborhood,
        approximateAddress: `Rua ${['das Flores', 'dos Pinheiros', 'da Paz', 'do Sol', 'das Acácias'][i % 5]}, ${100 + i * 37}`,
        description: SERVICE_DESCRIPTIONS[i],
        urgency: urgencies[i % 3],
        status: statuses[i],
      });
    }
    console.log(`  ✅ ${SERVICE_DESCRIPTIONS.length} solicitações de serviço criadas`);
  } else {
    console.log(`  ⏭️  Solicitações já existem (${existingRequests} no banco)`);
  }

  // ── Orçamentos demo ────────────────────────────────────────────────────────
  console.log('\n💰 Criando orçamentos demo...');
  const existingQuotes = await Quote.countDocuments();

  if (existingQuotes === 0) {
    const requests = await ServiceRequest.find({ status: { $in: ['quoted', 'scheduled', 'in_progress', 'completed'] } });
    const approvedProviders = await User.find({ role: 'provider', status: 'active' });

    for (const req of requests.slice(0, 5)) {
      const provider = approvedProviders[0];
      if (!provider) continue;

      const total = Math.floor(Math.random() * 800 + 200);
      await Quote.create({
        serviceRequestId: req._id,
        providerId: provider._id,
        totalAmount: total,
        depositAmount: Math.round(total * 0.2 * 100) / 100,
        remainingAmount: Math.round(total * 0.8 * 100) / 100,
        description: `Orçamento detalhado para o serviço solicitado. Inclui mão de obra e deslocamento.`,
        estimatedTime: `${Math.floor(Math.random() * 3 + 1)} dia(s)`,
        warrantyDays: 30,
        status: req.status === 'completed' ? 'accepted' : req.status === 'scheduled' ? 'accepted' : 'sent',
      });
    }
    console.log('  ✅ Orçamentos demo criados');
  } else {
    console.log(`  ⏭️  Orçamentos já existem (${existingQuotes} no banco)`);
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
