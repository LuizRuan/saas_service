import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, FileText, ShieldAlert, BarChart3,
  Clock, CheckCircle2, AlertTriangle, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import api from '@/lib/axios';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';

const CHART_COLORS = ['#2563eb', '#16a34a', '#9333ea', '#d97706', '#dc2626', '#0891b2'];

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: 0.1 + i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

interface Stats {
  totalUsers: number;
  totalClients: number;
  totalProviders: number;
  pendingProviders: number;
  totalRequests: number;
  openRequests: number;
  totalOrders: number;
  completedOrders: number;
  totalDisputes: number;
  openDisputes: number;
  recentRequests: any[];
  recentPendingProviders: any[];
  requestsByCategory: { name: string; count: number }[];
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  open: { label: 'Aberto', className: 'bg-blue-100 text-blue-700' },
  quoted: { label: 'Orçado', className: 'bg-amber-100 text-amber-700' },
  scheduled: { label: 'Agendado', className: 'bg-violet-100 text-violet-700' },
  in_progress: { label: 'Em andamento', className: 'bg-cyan-100 text-cyan-700' },
  completed: { label: 'Concluído', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
};

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonDashboard />;

  const STAT_CARDS = [
    {
      icon: Users, label: 'Usuários totais', value: stats?.totalUsers ?? 0,
      sub: `${stats?.totalClients ?? 0} clientes · ${stats?.totalProviders ?? 0} prestadores`,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Briefcase, label: 'Prestadores', value: stats?.totalProviders ?? 0,
      sub: stats?.pendingProviders ? `${stats.pendingProviders} aguardando aprovação` : 'Todos aprovados',
      color: stats?.pendingProviders ? 'from-amber-500 to-orange-600' : 'from-violet-500 to-purple-600',
      alert: (stats?.pendingProviders ?? 0) > 0,
    },
    {
      icon: FileText, label: 'Solicitações', value: stats?.totalRequests ?? 0,
      sub: `${stats?.openRequests ?? 0} abertas`,
      color: 'from-primary to-primary-light',
    },
    {
      icon: ShieldAlert, label: 'Disputas', value: stats?.totalDisputes ?? 0,
      sub: `${stats?.openDisputes ?? 0} abertas`,
      color: (stats?.openDisputes ?? 0) > 0 ? 'from-red-500 to-rose-600' : 'from-slate-400 to-slate-500',
      alert: (stats?.openDisputes ?? 0) > 0,
    },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Visão geral</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Painel Administrativo</h1>
        <p className="text-slate-500 mt-1">Visão geral da plataforma MãoCerta.</p>
      </motion.div>

      {/* Alerta de prestadores pendentes */}
      {(stats?.pendingProviders ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">
              {stats!.pendingProviders} prestador{stats!.pendingProviders > 1 ? 'es' : ''} aguardando aprovação
            </p>
            <p className="text-sm text-amber-700/80 mt-0.5">
              Acesse a lista de prestadores para aprovar ou rejeitar os cadastros.
            </p>
          </div>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} shadow-md`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-end gap-2 mb-1">
              <p className="text-3xl font-bold text-slate-800">{card.value.toLocaleString('pt-BR')}</p>
              {card.alert && <span className="mb-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
            </div>
            <p className="text-sm font-medium text-slate-700">{card.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Gráfico + Ordens */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de pedidos por categoria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-slate-800">Pedidos por Categoria</h3>
          </div>
          {(stats?.requestsByCategory?.length ?? 0) === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              Sem dados disponíveis ainda
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats!.requestsByCategory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  cursor={{ fill: 'rgba(37,99,235,0.05)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Pedidos">
                  {stats!.requestsByCategory.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Métricas de ordens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
        >
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <h3 className="font-semibold text-slate-800">Ordens de Serviço</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Total de ordens', value: stats?.totalOrders ?? 0, icon: FileText, color: 'text-primary bg-primary-50' },
              { label: 'Concluídas', value: stats?.completedOrders ?? 0, icon: CheckCircle2, color: 'text-success bg-success-50' },
              { label: 'Em aberto', value: (stats?.totalOrders ?? 0) - (stats?.completedOrders ?? 0), icon: Clock, color: 'text-amber-600 bg-amber-50' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <span className="text-lg font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Últimas solicitações abertas */}
      {(stats?.recentRequests?.length ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-2xl border border-slate-100 bg-white shadow-card mb-6"
        >
          <div className="px-6 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800">Últimas solicitações abertas</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {stats!.recentRequests.map((req: any) => {
              const statusInfo = STATUS_MAP[req.status] ?? { label: req.status, className: 'bg-slate-100 text-slate-600' };
              return (
                <div key={req._id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {req.categoryId?.name ?? '—'} — {req.city}
                    </p>
                    <p className="text-xs text-slate-400">{req.clientId?.name ?? '—'} · {formatDate(req.createdAt)}</p>
                  </div>
                  <span className={`ml-4 text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Prestadores pendentes */}
      {(stats?.recentPendingProviders?.length ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="rounded-2xl border border-amber-100 bg-white shadow-card"
        >
          <div className="px-6 py-4 border-b border-amber-50 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-slate-800">Prestadores aguardando aprovação</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {stats!.recentPendingProviders.map((profile: any) => (
              <div key={profile._id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">{profile.userId?.name ?? '—'}</p>
                  <p className="text-xs text-slate-400">{profile.userId?.email ?? '—'}</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Pendente
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Estado vazio */}
      {!stats?.totalUsers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-card"
        >
          <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto mb-4" />
          <p className="font-semibold text-slate-700 mb-1">Nenhum dado disponível</p>
          <p className="text-sm text-slate-500">O banco de dados está vazio. Aguarde os primeiros cadastros.</p>
        </motion.div>
      )}
    </div>
  );
}
