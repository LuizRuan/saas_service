import { Category } from '../models/Category';

const initialCategories = [
  { name: 'Pintor', slug: 'pintor', description: 'Serviços de pintura residencial, comercial e industrial' },
  { name: 'Eletricista', slug: 'eletricista', description: 'Instalações e reparos elétricos residenciais e comerciais' },
  { name: 'Encanador', slug: 'encanador', description: 'Serviços hidráulicos, encanamento e consertos' },
  { name: 'Técnico de Ar-Condicionado', slug: 'tecnico-ar-condicionado', description: 'Instalação, manutenção e reparo de ar-condicionado' },
  { name: 'Técnico de Câmeras/Segurança', slug: 'tecnico-cameras-seguranca', description: 'Instalação e manutenção de câmeras e sistemas de segurança' },
  { name: 'Montador de Móveis', slug: 'montador-moveis', description: 'Montagem e desmontagem de móveis residenciais e comerciais' },
];

export async function seedCategories(): Promise<void> {
  const count = await Category.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  Categorias já existem (${count}). Pulando seed.`);
    return;
  }
  await Category.insertMany(initialCategories);
  console.log(`✅ ${initialCategories.length} categorias criadas`);
}
