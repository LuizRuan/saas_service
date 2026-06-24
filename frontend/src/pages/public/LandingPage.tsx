import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Shield, Star, Zap, ArrowRight, CheckCircle,
  Paintbrush, Zap as ZapIcon, Droplets, Wind, Camera, Package,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { categoryService } from '../../services/categoryService';
import type { Category } from '../../types/category';

const categoryIcons: Record<string, React.ReactNode> = {
  pintor: <Paintbrush className="w-6 h-6" />,
  eletricista: <ZapIcon className="w-6 h-6" />,
  encanador: <Droplets className="w-6 h-6" />,
  'tecnico-ar-condicionado': <Wind className="w-6 h-6" />,
  'tecnico-cameras-seguranca': <Camera className="w-6 h-6" />,
  'montador-moveis': <Package className="w-6 h-6" />,
};

const steps = [
  { num: '1', title: 'Solicite o serviço', desc: 'Descreva o que precisa e envie fotos. É gratuito.' },
  { num: '2', title: 'Receba orçamentos', desc: 'Prestadores aprovados enviam propostas com preço e prazo.' },
  { num: '3', title: 'Escolha e pague', desc: 'Aceite o melhor orçamento e pague um sinal de apenas 20%.' },
  { num: '4', title: 'Avalie o serviço', desc: 'Após a conclusão, avalie e pague o restante com segurança.' },
];

const benefits = [
  { icon: <Shield className="w-5 h-5 text-trust-600" />, title: 'Prestadores verificados', desc: 'Todos passam por análise antes de entrar na plataforma.' },
  { icon: <Star className="w-5 h-5 text-yellow-500" />, title: 'Avaliações reais', desc: 'Veja opiniões de clientes reais antes de contratar.' },
  { icon: <Zap className="w-5 h-5 text-primary-800" />, title: 'Rápido e seguro', desc: 'Orçamentos em minutos. Pagamento protegido.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/buscar?q=${encodeURIComponent(search)}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Encontre o prestador certo,{' '}
            <span className="text-trust-500">na hora certa</span>
          </h1>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Pintores, eletricistas, encanadores e muito mais. Profissionais verificados perto de você, com orçamentos rápidos e pagamento seguro.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="O que você precisa? Ex: pintor, eletricista..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-surface-800 text-sm outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
            <Button type="submit" size="lg" variant="success">
              Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-surface-800 text-center mb-2">Categorias de serviço</h2>
          <p className="text-surface-600 text-center text-sm mb-8">Clique para ver prestadores disponíveis na sua cidade</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Card
                key={cat._id}
                hover
                padding="md"
                className="text-center cursor-pointer"
                onClick={() => navigate(`/categoria/${cat.slug}`)}
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-2 text-primary-800">
                  {categoryIcons[cat.slug] ?? <Search className="w-6 h-6" />}
                </div>
                <p className="text-xs font-medium text-surface-800 leading-tight">{cat.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-surface-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-surface-800 text-center mb-2">Como funciona</h2>
          <p className="text-surface-600 text-center text-sm mb-10">Do pedido à conclusão, tudo em um só lugar</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-800 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {step.num}
                </div>
                <h3 className="font-semibold text-surface-800 mb-1">{step.title}</h3>
                <p className="text-sm text-surface-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-surface-800 text-center mb-10">Por que escolher a MãoCerta?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <Card key={b.title} padding="md">
                <div className="flex gap-3">
                  <div className="mt-0.5">{b.icon}</div>
                  <div>
                    <h3 className="font-semibold text-surface-800 mb-1">{b.title}</h3>
                    <p className="text-sm text-surface-600">{b.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Pronto para começar?</h2>
          <p className="text-white/80 mb-8">
            Cadastre-se gratuitamente e encontre o prestador ideal para o seu serviço hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="success" onClick={() => navigate('/cadastro/cliente')} icon={<ArrowRight className="w-4 h-4" />}>
              Quero contratar
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => navigate('/cadastro/prestador')}>
              Quero trabalhar
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-sm text-white/60">
            {['Gratuito para clientes', 'Sem taxa de adesão', 'Cancele quando quiser'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-trust-500" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
