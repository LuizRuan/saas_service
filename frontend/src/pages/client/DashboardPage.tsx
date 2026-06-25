import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  FileText, ClipboardList, CreditCard, Plus,
  Compass, ArrowRight, Sparkles, Star, TrendingUp,
  Zap,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: 'easeOut' as const },
});

const ACTION_CARDS = [
  {
    to: '/cliente/solicitacoes',
    icon: FileText,
    gradient: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/20 hover:border-blue-400/40',
    iconBg: 'from-blue-500 to-blue-600',
    iconGlow: 'rgba(59,130,246,0.4)',
    title: 'Minhas Solicitações',
    desc: 'Acompanhe os pedidos publicados e orçamentos recebidos.',
    badge: null,
  },
  {
    to: '/cliente/explorar',
    icon: Compass,
    gradient: 'from-emerald-500/20 to-teal-600/10',
    border: 'border-emerald-500/20 hover:border-emerald-400/40',
    iconBg: 'from-emerald-500 to-teal-600',
    iconGlow: 'rgba(16,185,129,0.4)',
    title: 'Explorar Categorias',
    desc: 'Navegue pelos serviços disponíveis e conheça os melhores profissionais.',
    badge: 'Novo',
  },
  {
    to: '/cliente/ordens',
    icon: ClipboardList,
    gradient: 'from-violet-500/20 to-purple-600/10',
    border: 'border-violet-500/20 hover:border-violet-400/40',
    iconBg: 'from-violet-500 to-purple-600',
    iconGlow: 'rgba(139,92,246,0.4)',
    title: 'Minhas Ordens',
    desc: 'Acompanhe os serviços em andamento e os já concluídos.',
    badge: null,
  },
];

const STATS = [
  { icon: TrendingUp, label: 'Solicitações', value: '—', color: 'text-blue-400' },
  { icon: Star, label: 'Avaliação média', value: '—', color: 'text-amber-400' },
  { icon: ClipboardList, label: 'Ordens ativas', value: '—', color: 'text-violet-400' },
];

export function ClientDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'usuário';

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Background decorative orbs */}
      <div className="orb w-96 h-96 bg-emerald-500 -top-32 -right-32 opacity-10" />
      <div className="orb w-64 h-64 bg-blue-600 top-40 -left-20 opacity-10" />

      {/* ── Welcome ─────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-emerald-400/80 uppercase tracking-widest">
            Bem-vindo de volta
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          Olá, <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">{firstName}!</span>
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
          Descreva o que precisa, receba orçamentos de profissionais verificados e escolha o melhor para o seu projeto.
        </p>
      </motion.div>

      {/* ── Mini stats ──────────────────────────── */}
      <motion.div {...fadeUp(0.08)} className="flex flex-wrap gap-4 mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/3 px-4 py-2.5">
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <span className="text-white/50 text-xs">{s.label}:</span>
            <span className="text-white font-semibold text-sm">{s.value}</span>
          </div>
        ))}
      </motion.div>

      {/* ── CTA Principal ───────────────────────── */}
      <motion.div {...fadeUp(0.15)} className="mb-8">
        <Link
          to="/cliente/solicitacoes/nova"
          className="group relative flex items-center gap-5 rounded-2xl p-6 sm:p-7 overflow-hidden border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(20,184,166,0.08) 100%)' }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)' }} />

          {/* Icon */}
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl group-hover:scale-105 transition-transform duration-300"
            style={{ boxShadow: '0 0 30px -5px rgba(16,185,129,0.5)' }}>
            <Zap className="h-6 w-6 text-white" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-lg text-white">Publicar serviço que preciso</p>
              <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                Grátis
              </span>
            </div>
            <p className="text-sm text-white/45">
              Descreva o serviço, receba orçamentos e escolha o melhor prestador para o projeto.
            </p>
          </div>

          {/* Arrow */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-all duration-300">
            <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </Link>
      </motion.div>

      {/* ── Action Cards ────────────────────────── */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {ACTION_CARDS.map((card, i) => (
          <motion.div key={card.to} {...fadeUp(0.2 + i * 0.08)}>
            <Link
              to={card.to}
              className={`group relative flex flex-col rounded-2xl border p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 ${card.border}`}
              style={{ background: `linear-gradient(135deg, ${card.gradient.replace('from-', '').replace('to-', '')})` }}
            >
              {/* Card glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ boxShadow: `inset 0 0 40px -10px ${card.iconGlow}` }} />

              {/* Badge */}
              {card.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                  {card.badge}
                </span>
              )}

              {/* Icon */}
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                style={{ boxShadow: `0 8px 20px -5px ${card.iconGlow}` }}
              >
                <card.icon className="h-5 w-5 text-white" />
              </div>

              <h3 className="font-bold text-white mb-1.5 group-hover:translate-x-0.5 transition-transform duration-200">
                {card.title}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed flex-1">{card.desc}</p>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-white/30 group-hover:text-white/60 transition-colors">
                Acessar
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Pagamentos - Em breve */}
        <motion.div {...fadeUp(0.44)}>
          <div className="relative flex flex-col rounded-2xl border border-white/5 p-6 opacity-40 cursor-not-allowed overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
              <CreditCard className="h-5 w-5 text-white/30" />
            </div>
            <h3 className="font-bold text-white/50 mb-1.5">Pagamentos</h3>
            <p className="text-sm text-white/25 leading-relaxed flex-1">
              Histórico de sinais e pagamentos realizados.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/25 bg-white/5 border border-white/8 rounded-full px-3 py-1 w-fit">
              <Plus className="h-3 w-3 rotate-45" /> Em breve
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Quick tips ──────────────────────────── */}
      <motion.div {...fadeUp(0.5)}
        className="rounded-2xl border border-white/5 p-5 flex items-start gap-4"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Star className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white/70 mb-0.5">Dica rápida</p>
          <p className="text-xs text-white/35 leading-relaxed">
            Quanto mais detalhada for a descrição do seu serviço, mais orçamentos precisos você receberá.
            Adicione fotos do local para facilitar o trabalho do profissional.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
