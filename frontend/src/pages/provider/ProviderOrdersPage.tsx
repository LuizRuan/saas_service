import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, AlertCircle, ArrowRight,
  Calendar, Clock,
} from 'lucide-react';
import { orderService } from '@/services/order.service';
import { fadeUp } from '@/lib/animations';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> = {
  created:          { label: 'Aguardando sinal',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  scheduled:        { label: 'Agendada',            cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  in_progress:      { label: 'Em andamento',        cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  waiting_approval: { label: 'Aguard. aprovação',   cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  completed:        { label: 'Concluída',            cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelada',            cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

export function ProviderOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (p: number) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const result = await orderService.getMy(p, 10);
      setOrders(prev => p === 1 ? result.items : [...prev, ...result.items]);
      setHasMore(p < result.pagination.totalPages);
    } catch {
      if (p === 1) setError('Não foi possível carregar suas ordens.');
    } finally {
      if (p === 1) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  return (
    <div className="relative max-w-4xl mx-auto space-y-6">
      <div className="orb w-72 h-72 bg-orange-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/15 border border-orange-500/20">
            <ClipboardList className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <span className="text-xs font-semibold text-orange-400/80 uppercase tracking-widest">Trabalhos</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Minhas <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-300">Ordens</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Serviços aceitos e em andamento.</p>
      </motion.div>

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-5 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="h-4 bg-white/5 rounded-lg w-1/3 mb-3" />
              <div className="h-3 bg-white/5 rounded-lg w-2/3 mb-2" />
              <div className="h-3 bg-white/5 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <motion.div {...fadeUp(0)} className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
            <ClipboardList className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="font-semibold text-white/60 mb-1">Nenhuma ordem ainda</h3>
          <p className="text-sm text-white/30 max-w-xs mb-5">
            Quando um cliente aceitar seu orçamento, a ordem de serviço aparecerá aqui.
          </p>
          <Link
            to="/prestador/pedidos"
            className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Ver pedidos disponíveis <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}

      {/* List */}
      {!loading && !error && orders.length > 0 && (
        <>
        <motion.div {...fadeUp(0.05)} className="space-y-3">
          {orders.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.created;
            const client = typeof order.clientId === 'object' ? order.clientId : null;
            const quote = typeof order.quoteId === 'object' ? order.quoteId : null;
            const totalAmount = quote?.totalAmount ?? order.totalAmount ?? 0;
            return (
              <motion.div key={order._id} {...fadeUp(0.05 + i * 0.01)}>
                <Link
                  to={`/prestador/ordens/${order._id}`}
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-white/5 p-5 hover:border-white/15 hover:-translate-y-0.5 transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white group-hover:text-orange-300 transition-colors">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {client && (
                      <p className="text-xs text-white/40">Cliente: {(client as any).name ?? '—'}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-white/35">
                        <Calendar className="h-3 w-3" />{formatDate(order.createdAt)}
                      </div>
                      {order.scheduledDate && (
                        <div className="flex items-center gap-1.5 text-xs text-white/35">
                          <Clock className="h-3 w-3" />Agend.: {formatDate(order.scheduledDate)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">{formatCurrency(totalAmount)}</p>
                    <p className="text-xs text-white/30 mt-0.5">Ver detalhes →</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
        {hasMore && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loadingMore}
              className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white/80 disabled:opacity-50 transition-all"
            >
              {loadingMore ? 'Carregando...' : 'Carregar mais'}
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
}
