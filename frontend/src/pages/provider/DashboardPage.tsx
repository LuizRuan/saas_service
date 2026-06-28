import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, FileText, ClipboardList, Star, AlertTriangle,
  ArrowRight, Zap, CheckCircle2, TrendingUp, Users, RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { fadeUp } from '@/lib/animations';

interface ProviderStats {
  availableRequests: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  profileStatus: 'pending' | 'approved' | 'blocked';
}

const ACTION_CARDS = [
  {
    to: '/prestador/pedidos',
    icon: Search,
    gradient: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/20 hover:border-blue-400/40',
    iconBg: 'from-blue-500 to-blue-600',
    iconGlow: 'rgba(59,130,246,0.4)',
    title: 'Pedidos Disponíveis',
    desc: 'Veja pedidos de clientes na sua região e envie seus orçamentos.',
  },
  {
    to: '/prestador/orcamentos',
    icon: FileText,
    gradient: 'from-violet-500/20 to-purple-600/10',
    border: 'border-violet-500/20 hover:border-violet-400/40',
    iconBg: 'from-violet-500 to-purple-600',
    iconGlow: 'rgba(139,92,246,0.4)',
    title: 'Meus Orçamentos',
    desc: 'Acompanhe as propostas enviadas e seus status de aprovação.',
  },
  {
    to: '/prestador/ordens',
    icon: ClipboardList,
    gradient: 'from-orange-500/20 to-orange-600/10',
    border: 'border-orange-500/20 hover:border-orange-400/40',
    iconBg: 'from-orange-500 to-orange-600',
    iconGlow: 'rgba(249,115,22,0.4)',
    title: 'Minhas Ordens',
    desc: 'Gerencie os serviços em andamento e concluídos.',
  },
];

export function ProviderDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const firstName = user?.name?.split(' ')[0] ?? 'profissional';

  const fetchStats = useCallback((initial = false) => {
    if (!initial) setRefreshing(true);
    const controller = new AbortController();
    Promise.all([
      api.get('/providers/me', { signal: controller.signal }),
      api.get('/quotes', { signal: controller.signal }),
      api.get('/service-requests/available', { signal: controller.signal }),
    ]).then(([profileRes, quotesRes, requestsRes]) => {
      const profile = profileRes.data.data;
      const quotes: any[] = quotesRes.data.data ?? [];
      const requests: any[] = requestsRes.data.data ?? [];
      setStats({
        availableRequests: requests.length,
        pendingQuotes: quotes.filter(q => q.status === 'sent').length,
        acceptedQuotes: quotes.filter(q => q.status === 'accepted').length,
        profileStatus: profile?.status ?? 'pending',
      });
    }).catch(() => {
      if (!controller.signal.aborted) {
        setStats({ availableRequests: 0, pendingQuotes: 0, acceptedQuotes: 0, profileStatus: 'pending' });
      }
    }).finally(() => {
      setRefreshing(false);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    return fetchStats(true);
  }, [fetchStats]);

  const isPending = stats?.profileStatus === 'pending' || !stats;
  const isApproved = stats?.profileStatus === 'approved';

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Orbs */}
      <div className="orb w-80 h-80 bg-blue-600 -top-20 -right-20 opacity-10 pointer-events-none" />
      <div className="orb w-64 h-64 bg-violet-600 bottom-20 -left-20 opacity-8 pointer-events-none" />

      {/* ── Status Banner ──────────────────────── */}
      {isPending && (
        <motion.div {...fadeUp(0)}
          className="mb-6 flex items-start gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/8 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-amber-300">Perfil aguardando aprovação</p>
            <p className="text-sm text-amber-400/60 mt-0.5">
              Seu cadastro está em análise. Assim que aprovado, você visualizará pedidos e enviará orçamentos.
            </p>
          </div>
        </motion.div>
      )}

      {isApproved && (
        <motion.div {...fadeUp(0)}
          className="mb-6 flex items-start gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-emerald-300">Perfil aprovado! 🎉</p>
            <p className="text-sm text-emerald-400/60 mt-0.5">
              Você já pode visualizar pedidos e enviar orçamentos para clientes na sua região.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Welcome ────────────────────────────── */}
      <motion.div {...fadeUp(0.05)} className="mb-8">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/20">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-blue-400/80 uppercase tracking-widest">Área do prestador</span>
          </div>
          <button
            onClick={() => fetchStats(false)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white/80 hover:border-white/20 transition-all disabled:opacity-40"
            aria-label="Atualizar estatísticas"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          Olá, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">{firstName}!</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-md">
          Acompanhe seus pedidos disponíveis, orçamentos enviados e conquiste novos clientes.
        </p>
      </motion.div>

      {/* ── Mini KPIs ──────────────────────────── */}
      <motion.div {...fadeUp(0.1)} className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: TrendingUp, label: 'Pedidos disponíveis', value: stats ? String(stats.availableRequests) : '—',              color: 'text-blue-400'    },
          { icon: FileText,   label: 'Orçamentos enviados',  value: stats ? String(stats.pendingQuotes + stats.acceptedQuotes) : '—', color: 'text-violet-400'  },
          { icon: Users,      label: 'Orçamentos aceitos',   value: stats ? String(stats.acceptedQuotes) : '—',                   color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label}
            className="flex flex-col items-center text-center rounded-2xl border border-white/8 py-4 px-3"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-white/35 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── CTA Principal ──────────────────────── */}
      <motion.div {...fadeUp(0.15)} className="mb-8">
        <button
          onClick={() => navigate('/prestador/pedidos')}
          className="group relative w-full flex items-center gap-5 rounded-2xl p-6 sm:p-7 overflow-hidden
            border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 text-left"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.08) 100%)' }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)' }} />

          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
            bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl group-hover:scale-105 transition-transform"
            style={{ boxShadow: '0 0 30px -5px rgba(59,130,246,0.5)' }}>
            <Search className="h-6 w-6 text-white" />
          </div>

          <div className="flex-1">
            <p className="font-bold text-lg text-white">Ver pedidos disponíveis</p>
            <p className="text-sm text-white/40 mt-0.5">
              Encontre clientes que precisam dos seus serviços na sua região.
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
            border border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-500/10 transition-all">
            <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>
      </motion.div>

      {/* ── Action Cards ───────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {ACTION_CARDS.map((card, i) => (
          <motion.div key={card.to} {...fadeUp(0.2 + i * 0.08)}>
            <Link to={card.to}
              className={`group relative flex flex-col rounded-2xl border p-6 overflow-hidden
                transition-all duration-300 hover:-translate-y-1 ${card.border}`}
              style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))` }}>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ boxShadow: `inset 0 0 40px -10px ${card.iconGlow}` }} />

              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br
                ${card.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                style={{ boxShadow: `0 8px 20px -5px ${card.iconGlow}` }}>
                <card.icon className="h-5 w-5 text-white" />
              </div>

              <h3 className="font-bold text-white mb-1.5">{card.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed flex-1">{card.desc}</p>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-white/30 group-hover:text-white/60 transition-colors">
                Acessar <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Em breve */}
        {[
          { icon: Star, title: 'Avaliações', desc: 'Veja o que os clientes dizem sobre seu trabalho.' },
        ].map((card, i) => (
          <motion.div key={card.title} {...fadeUp(0.36 + i * 0.08)}>
            <div className="relative flex flex-col rounded-2xl border border-white/5 p-6 opacity-35 cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                <card.icon className="h-5 w-5 text-white/30" />
              </div>
              <h3 className="font-bold text-white/50 mb-1.5">{card.title}</h3>
              <p className="text-sm text-white/25 leading-relaxed">{card.desc}</p>
              <span className="mt-4 inline-flex items-center text-[10px] font-bold uppercase tracking-widest
                text-white/25 bg-white/5 border border-white/8 rounded-full px-3 py-1 w-fit">
                Em breve
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
