import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, FileText, ShieldAlert, BarChart3,
  Clock, CheckCircle2, AlertTriangle, TrendingUp, Activity, AlertCircle, RefreshCw,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '@/lib/axios';
import { onAdminRefresh } from '@/lib/adminEvents';
import { formatDate } from '@/lib/utils';

const CHART_COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' as const },
});

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  open:      { label: 'Aberto',      cls: 'text-blue-400   bg-blue-500/10   border-blue-500/20'   },
  quoted:    { label: 'Orçado',      cls: 'text-amber-400  bg-amber-500/10  border-amber-500/20'  },
  scheduled: { label: 'Agendado',    cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  completed: { label: 'Concluído',   cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled: { label: 'Cancelado',   cls: 'text-red-400    bg-red-500/10    border-red-500/20'    },
};

interface Stats {
  totalUsers: number; totalClients: number; totalProviders: number;
  pendingProviders: number; totalRequests: number; openRequests: number;
  totalOrders: number; completedOrders: number; totalDisputes: number;
  openDisputes: number; recentRequests: any[]; recentPendingProviders: any[];
  requestsByCategory: { name: string; count: number }[];
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback((showLoader = false) => {
    if (showLoader) setLoading(true);
    setFetchError(false);
    api.get('/admin/stats')
      .then(res => { setStats(res.data.data); setLastUpdated(new Date()); })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStats(true);

    // Fallback: re-fetch a cada 60s para mudanças externas (outro admin, outra aba)
    const interval = setInterval(() => fetchStats(false), 60_000);

    // Atualização imediata quando qualquer ação admin emite o evento
    const unsubscribe = onAdminRefresh(() => fetchStats(false));

    // Atualiza ao voltar para a aba
    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchStats(false); };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-white/10 rounded-xl w-64 animate-pulse" />
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="rounded-2xl border border-white/10 h-32 animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          {[1,2].map(i => <div key={i} className="rounded-2xl border border-white/10 h-48 animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { icon: Users,      label: 'Usuários',     value: stats?.totalUsers ?? 0,    sub: `${stats?.totalClients ?? 0} clientes · ${stats?.totalProviders ?? 0} prestadores`, gradient: 'from-blue-500 to-blue-600',   glow: 'rgba(59,130,246,0.35)',   alert: false },
    { icon: Briefcase,  label: 'Prestadores',  value: stats?.totalProviders ?? 0, sub: stats?.pendingProviders ? `${stats.pendingProviders} aguardando aprovação` : 'Todos aprovados', gradient: stats?.pendingProviders ? 'from-amber-500 to-orange-600' : 'from-violet-500 to-purple-600', glow: stats?.pendingProviders ? 'rgba(245,158,11,0.35)' : 'rgba(139,92,246,0.35)', alert: (stats?.pendingProviders ?? 0) > 0 },
    { icon: FileText,   label: 'Solicitações', value: stats?.totalRequests ?? 0,  sub: `${stats?.openRequests ?? 0} abertas`, gradient: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.35)', alert: false },
    { icon: ShieldAlert,label: 'Disputas',     value: stats?.totalDisputes ?? 0,  sub: `${stats?.openDisputes ?? 0} abertas`, gradient: (stats?.openDisputes ?? 0) > 0 ? 'from-red-500 to-rose-600' : 'from-slate-500 to-slate-600', glow: 'rgba(239,68,68,0.35)', alert: (stats?.openDisputes ?? 0) > 0 },
  ];

  return (
    <div className="relative max-w-6xl mx-auto">
      <div className="orb w-80 h-80 bg-blue-600 -top-20 -right-20 opacity-10 pointer-events-none" />
      <div className="orb w-64 h-64 bg-violet-600 bottom-20 -left-20 opacity-8 pointer-events-none" />

      {/* Error banner */}
      {fetchError && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">Falha ao carregar estatísticas. Os dados exibidos podem estar incompletos.</p>
        </div>
      )}

      {/* Header */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/20">
                <Activity className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-blue-400/80 uppercase tracking-widest">Visão geral</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Painel <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Administrativo</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Dados atualizados automaticamente a cada 30 segundos.
              {lastUpdated && (
                <span className="ml-2 text-white/25">
                  Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => fetchStats(false)}
            title="Atualizar agora"
            className="mt-1 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/50 hover:bg-white/10 hover:text-white/80 transition-all shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar
          </button>
        </div>
      </motion.div>

      {/* Alert pendentes */}
      {(stats?.pendingProviders ?? 0) > 0 && (
        <motion.div {...fadeUp(0.05)} className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] p-4">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-300">{stats!.pendingProviders} prestador{stats!.pendingProviders > 1 ? 'es' : ''} aguardando aprovação</p>
            <p className="text-sm text-amber-400/60 mt-0.5">Acesse a lista de prestadores para aprovar ou rejeitar os cadastros.</p>
          </div>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((card, i) => (
          <motion.div key={card.label} {...fadeUp(0.1 + i * 0.07)}
            className="relative rounded-2xl border border-white/8 p-5 overflow-hidden group hover:-translate-y-0.5 transition-transform"
            style={{ background: 'rgba(255,255,255,0.03)', boxShadow: `inset 0 0 30px -15px ${card.glow}` }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `radial-gradient(circle at top right, ${card.glow.replace('0.35', '0.08')} 0%, transparent 60%)` }} />
            <div className={`relative mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg`}
              style={{ boxShadow: `0 8px 20px -5px ${card.glow}` }}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <div className="relative flex items-end gap-2 mb-0.5">
              <p className="text-3xl font-bold text-white">{card.value.toLocaleString('pt-BR')}</p>
              {card.alert && <span className="mb-1.5 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
            </div>
            <p className="relative text-sm font-semibold text-white/70">{card.label}</p>
            <p className="relative text-xs text-white/35 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Orders */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        {/* Bar chart */}
        <motion.div {...fadeUp(0.38)} className="rounded-2xl border border-white/8 p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <h3 className="font-semibold text-white">Pedidos por Categoria</h3>
          </div>
          {(stats?.requestsByCategory?.length ?? 0) === 0 ? (
            <div className="flex items-center justify-center h-44 text-white/25 text-sm">Sem dados disponíveis ainda</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats!.requestsByCategory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Pedidos">
                  {stats!.requestsByCategory.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Orders metrics */}
        <motion.div {...fadeUp(0.44)} className="rounded-2xl border border-white/8 p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <h3 className="font-semibold text-white">Ordens de Serviço</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Total de ordens',  value: stats?.totalOrders ?? 0,     icon: FileText,    color: 'text-blue-400   bg-blue-500/10   border-blue-500/20'   },
              { label: 'Concluídas',       value: stats?.completedOrders ?? 0,  icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Em aberto',        value: (stats?.totalOrders ?? 0) - (stats?.completedOrders ?? 0), icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-white/60">{item.label}</span>
                </div>
                <span className="text-xl font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent requests */}
      {(stats?.recentRequests?.length ?? 0) > 0 && (
        <motion.div {...fadeUp(0.5)} className="rounded-2xl border border-white/8 mb-5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-white/40" />
            <h3 className="font-semibold text-white/80">Últimas solicitações</h3>
          </div>
          <div className="divide-y divide-white/5">
            {stats!.recentRequests.map((req: any) => {
              const s = STATUS_MAP[req.status] ?? { label: req.status, cls: 'text-white/40 bg-white/5 border-white/10' };
              return (
                <div key={req._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white/75 truncate">{req.categoryId?.name ?? '—'} — {req.city}</p>
                    <p className="text-xs text-white/30">{req.clientId?.name ?? '—'} · {formatDate(req.createdAt)}</p>
                  </div>
                  <span className={`ml-4 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${s.cls}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Pending providers */}
      {(stats?.recentPendingProviders?.length ?? 0) > 0 && (
        <motion.div {...fadeUp(0.56)} className="rounded-2xl border border-amber-500/15 overflow-hidden" style={{ background: 'rgba(245,158,11,0.04)' }}>
          <div className="px-5 py-4 border-b border-amber-500/10 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="font-semibold text-amber-300/80">Prestadores aguardando aprovação</h3>
          </div>
          <div className="divide-y divide-white/5">
            {stats!.recentPendingProviders.map((profile: any) => (
              <div key={profile._id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-white/75">{profile.userId?.name ?? '—'}</p>
                  <p className="text-xs text-white/30">{profile.userId?.email ?? '—'}</p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border text-amber-400 bg-amber-500/10 border-amber-500/20">Pendente</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
