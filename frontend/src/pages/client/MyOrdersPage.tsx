import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, MapPin, Calendar, ArrowRight,
  CheckCircle2, Clock, XCircle, Package, Plus, AlertCircle,
} from 'lucide-react';
import { orderService } from '@/services/order.service';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as const },
});

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; cls: string }> = {
  created:          { label: 'Aguardando início',    icon: Clock,         cls: 'text-amber-400   bg-amber-500/10   border-amber-500/20'   },
  scheduled:        { label: 'Agendado',             icon: Calendar,      cls: 'text-blue-400    bg-blue-500/10    border-blue-500/20'    },
  in_progress:      { label: 'Em andamento',         icon: Package,       cls: 'text-violet-400  bg-violet-500/10  border-violet-500/20'  },
  waiting_approval: { label: 'Aguardando aprovação', icon: Clock,         cls: 'text-amber-400   bg-amber-500/10   border-amber-500/20'   },
  completed:        { label: 'Concluído',            icon: CheckCircle2,  cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelado',            icon: XCircle,       cls: 'text-red-400     bg-red-500/10     border-red-500/20'     },
};

export function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    orderService.getMy()
      .then(data => setOrders(data))
      .catch(() => {
        if (!controller.signal.aborted) setError('Não foi possível carregar suas ordens.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="orb w-72 h-72 bg-violet-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      {/* Header */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/15 border border-violet-500/20">
            <ClipboardList className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <span className="text-xs font-semibold text-violet-400/80 uppercase tracking-widest">Histórico</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Minhas <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-300">Ordens</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Acompanhe os serviços em andamento e concluídos.</p>
          </div>
          <button
            onClick={() => navigate('/cliente/solicitacoes/nova')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30
              hover:bg-emerald-600/30 text-emerald-400 text-sm font-semibold px-4 py-2.5 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo serviço</span>
          </button>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-5 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="h-4 bg-white/8 rounded-lg w-1/3 mb-3" />
              <div className="h-3 bg-white/5 rounded-lg w-2/3 mb-2" />
              <div className="h-3 bg-white/5 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <motion.div {...fadeUp(0)}
          className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <motion.div {...fadeUp(0)}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/8 mb-4">
            <ClipboardList className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="font-semibold text-white/60 mb-1">Nenhuma ordem ainda</h3>
          <p className="text-sm text-white/30 max-w-xs mb-5">
            Quando você aceitar um orçamento de um prestador, a ordem de serviço aparecerá aqui.
          </p>
          <button
            onClick={() => navigate('/cliente/solicitacoes')}
            className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Ver minhas solicitações
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Orders list */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            const catName = (order.serviceRequestId as any)?.categoryId?.name ?? '—';
            const city = order.serviceRequestId?.city ?? '—';
            const description = order.serviceRequestId?.description ?? '';
            const providerName = order.providerId?.name ?? '—';

            return (
              <motion.div key={order._id} {...fadeUp(i)}>
                <Link
                  to={`/cliente/solicitacoes/${typeof order.serviceRequestId === 'object' ? (order.serviceRequestId as any)?._id : order.serviceRequestId}`}
                  className="group block rounded-2xl border border-white/8 p-5 transition-all duration-300
                    hover:border-white/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                        {catName}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5 truncate">
                        Prestador: {providerName}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.cls} shrink-0`}>
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </div>

                  <p className="text-sm text-white/45 line-clamp-2 mb-4 leading-relaxed">{description}</p>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-white/35">
                      <MapPin className="h-3 w-3" />
                      {city}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/35">
                      <Calendar className="h-3 w-3" />
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="ml-auto">
                      <span className="text-sm font-bold text-white">{formatCurrency(order.totalAmount)}</span>
                      <span className="text-xs text-white/30 ml-1">total</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
