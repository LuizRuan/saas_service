import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PaintBucket,
  Zap,
  Droplets,
  Wind,
  Camera,
  Sofa,
  Wrench,
  ShieldCheck,
  Star,
  BadgeCheck,
  ChevronRight,
  Search,
  ClipboardList,
  HandCoins,
  Hammer,
  MessageSquare,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  Eye,
} from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { Button } from '@/components/ui/Button';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import type { Category } from '@/types';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  pintor: PaintBucket,
  eletricista: Zap,
  encanador: Droplets,
  'tecnico-ar-condicionado': Wind,
  'tecnico-cameras-seguranca': Camera,
  'montador-de-moveis': Sofa,
};

function getCategoryIcon(slug: string) {
  return CATEGORY_ICONS[slug] ?? Wrench;
}

const CLIENT_STEPS = [
  { icon: Search, title: 'Publique o serviço', desc: 'Descreva o que precisa, a cidade e a urgência. É rápido e gratuito.' },
  { icon: ClipboardList, title: 'Receba orçamentos', desc: 'Prestadores verificados da sua região enviam propostas detalhadas.' },
  { icon: HandCoins, title: 'Escolha o melhor prestador', desc: 'Compare valores, prazo e garantia. Contrate com segurança.' },
];

const PROVIDER_STEPS = [
  { icon: Hammer, title: 'Encontre pedidos disponíveis', desc: 'Veja solicitações na sua área e especialidade.' },
  { icon: MessageSquare, title: 'Envie seu orçamento', desc: 'Proponha seus valores, prazo e garantia ao cliente.' },
  { icon: Clock, title: 'Organize suas ordens de serviço', desc: 'Gerencie serviços aceitos e acompanhe tudo na plataforma.' },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Prestadores verificados',
    desc: 'Todos os profissionais passam por aprovação antes de enviar orçamentos na plataforma.',
    color: 'from-blue-500 to-primary',
  },
  {
    icon: Eye,
    title: 'Orçamentos transparentes',
    desc: 'Compare valores, prazo e garantia lado a lado antes de tomar sua decisão.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: FileCheck,
    title: 'Acompanhamento do serviço',
    desc: 'Acompanhe cada etapa — da solicitação à conclusão — em tempo real.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Star,
    title: 'Avaliações verificadas',
    desc: 'Apenas clientes que contrataram podem avaliar. Confiança de verdade.',
    color: 'from-emerald-500 to-green-600',
  },
];

// Floating cards for the hero visual
const FLOATING_CARDS = [
  { label: 'Solicitação criada', icon: CheckCircle2, color: 'text-blue-500', delay: 0 },
  { label: 'Orçamento recebido', icon: FileCheck, color: 'text-emerald-500', delay: 0.2 },
  { label: 'Prestador verificado', icon: BadgeCheck, color: 'text-violet-500', delay: 0.4 },
  { label: 'Pagamento seguro', icon: ShieldCheck, color: 'text-amber-500', delay: 0.6 },
];

export function LandingPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-hero min-h-[calc(100vh-4rem)] flex items-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-success/5 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-light/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/[0.02] rounded-full blur-2xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Trust badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/[0.08] border border-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm"
              >
                <BadgeCheck className="h-4 w-4 text-success" />
                Prestadores verificados • Orçamentos rápidos • Pagamento seguro
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight text-white mb-6">
                Contrate serviços locais com mais segurança e praticidade{' '}
                <span className="text-success">na sua cidade</span>
              </h1>

              <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-xl leading-relaxed">
                Publique o serviço que você precisa, receba orçamentos de prestadores verificados e acompanhe
                tudo em uma plataforma simples, segura e profissional.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/cadastro">
                  <Button
                    size="lg"
                    className="bg-success hover:bg-success-dark text-white border-0 shadow-glow w-full sm:w-auto text-base"
                  >
                    Publicar um serviço
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/cadastro">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="border border-white/20 text-white hover:bg-white/10 w-full sm:w-auto text-base"
                  >
                    Sou prestador
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Floating cards */}
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[420px]">
                {FLOATING_CARDS.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5 + card.delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={`absolute ${
                      i === 0 ? 'top-0 left-4' :
                      i === 1 ? 'top-8 right-0' :
                      i === 2 ? 'bottom-24 left-0' :
                      'bottom-0 right-8'
                    }`}
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                      className="flex items-center gap-3 rounded-2xl bg-white/[0.08] border border-white/10 backdrop-blur-md px-5 py-4 shadow-premium"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <card.icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{card.label}</p>
                        <p className="text-xs text-white/50">Agora mesmo</p>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
                {/* Central glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-success/10 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="como-funciona" className="py-24 bg-white relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary bg-primary-50 px-4 py-1.5 rounded-full mb-4">
              Simples e seguro
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Como funciona</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Dois caminhos, um objetivo: conectar quem precisa a quem faz.</p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Para clientes */}
            <AnimatedSection delay={0.1}>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary mb-8">
                <Search className="h-4 w-4" />
                Para clientes
              </div>
              <div className="space-y-8">
                {CLIENT_STEPS.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                    className="flex gap-5 group"
                  >
                    <div className="relative">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow">
                        {i + 1}
                      </div>
                      {i < CLIENT_STEPS.length - 1 && (
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-200" />
                      )}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-slate-800 mb-1 text-base">{step.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>

            {/* Para prestadores */}
            <AnimatedSection delay={0.2}>
              <div className="inline-flex items-center gap-2 rounded-full bg-success-50 px-4 py-2 text-sm font-semibold text-success-dark mb-8">
                <Hammer className="h-4 w-4" />
                Para prestadores
              </div>
              <div className="space-y-8">
                {PROVIDER_STEPS.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                    className="flex gap-5 group"
                  >
                    <div className="relative">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow">
                        {i + 1}
                      </div>
                      {i < PROVIDER_STEPS.length - 1 && (
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-200" />
                      )}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-slate-800 mb-1 text-base">{step.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Categorias ── */}
      {categories.length > 0 && (
        <section id="categorias" className="py-24 bg-slate-50 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-14">
              <span className="inline-block text-sm font-semibold text-primary bg-primary-50 px-4 py-1.5 rounded-full mb-4">
                Especialidades
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Categorias de serviço</h2>
              <p className="text-slate-500">Encontre profissionais especializados no que você precisa.</p>
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" staggerDelay={0.08}>
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
                return (
                  <StaggerItem key={cat._id}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="flex flex-col items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-card hover:shadow-card-hover cursor-pointer group transition-colors"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 text-center">{cat.name}</span>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ── Benefícios ── */}
      <section id="beneficios" className="py-24 bg-white relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary bg-primary-50 px-4 py-1.5 rounded-full mb-4">
              Vantagens
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Por que usar a MãoCerta?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Segurança e confiança do início ao fim do serviço.</p>
          </AnimatedSection>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {BENEFITS.map((b) => (
              <StaggerItem key={b.title}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center text-center rounded-2xl border border-slate-100 bg-white p-8 shadow-card hover:shadow-card-hover transition-shadow h-full"
                >
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${b.color} shadow-md`}>
                    <b.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Segurança ── */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-hero text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-success/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/10 border border-white/10 backdrop-blur-sm"
              >
                <ShieldCheck className="h-10 w-10 text-success" />
              </motion.div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Seu dinheiro protegido até o fim</h2>
                <p className="text-white/60 max-w-2xl text-lg leading-relaxed">
                  O pagamento fica retido na plataforma. O prestador recebe apenas após você confirmar que o
                  serviço foi concluído com qualidade. Se houver problema, nossa equipe resolve.
                </p>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── CTA final ── */}
      <section className="py-24 bg-gradient-to-br from-success-dark via-success to-success-light relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Pronto para começar?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Cadastre-se gratuitamente e encontre o profissional certo para o seu projeto.
            </p>
            <Link to="/cadastro">
              <Button
                size="lg"
                className="bg-white text-success-dark hover:bg-slate-50 font-bold border-0 shadow-premium text-base px-10"
              >
                Criar conta grátis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
