import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Search, AlertCircle, X, Filter, User, Wrench } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type { AdminOrder } from '@/services/admin.service';
import { fadeUp } from '@/lib/animations';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  created:          { label: 'Criada',             cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  scheduled:        { label: 'Agendada',            cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  in_progress:      { label: 'Em andamento',        cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  waiting_approval: { label: 'Aguard. aprovação',   cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  completed:        { label: 'Concluída',            cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelada',            cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'created', label: 'Criada' },
  { value: 'scheduled', label: 'Agendada' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'waiting_approval', label: 'Aguard. aprovação' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  useEffect(() => {
    setLoading(true);
    adminService.getOrders(200)
      .then(({ orders, total }) => { setOrders(orders); setTotal(total); })
      .catch(() => setError('Não foi possível carregar as ordens.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      (o.clientId?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (o.providerId?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-orange-400" /> Ordens
          </h1>
          <p className="text-sm text-white/40 mt-1">{total} ordem{total !== 1 ? 'ns' : ''} no total</p>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou prestador..."
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5
              text-sm text-white placeholder:text-white/20 outline-none focus:border-orange-500/50 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5
              text-sm text-white outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value} style={{ background: '#0d1530' }}>{o.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-2.5 bg-white/5 rounded w-1/3" />
                </div>
                <div className="h-5 w-20 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhuma ordem encontrada.</p>
        </div>
      ) : (
        <motion.div {...fadeUp(0.1)} className="space-y-2">
          {filtered.map((order, i) => (
            <motion.div key={order._id} {...fadeUp(0.05 + i * 0.015)}
              className="flex items-center gap-4 rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.02)' }}
              onClick={() => setSelected(order)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-white/5">
                <ClipboardList className="h-5 w-5 text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  #{order._id.slice(-6).toUpperCase()}
                </p>
                <p className="text-xs text-white/35 truncate flex items-center gap-2">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{order.clientId?.name ?? '—'}</span>
                  <span className="text-white/20">·</span>
                  <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{order.providerId?.name ?? '—'}</span>
                </p>
                {order.scheduledDate && (
                  <p className="text-xs text-white/25">Agendado: {formatDate(order.scheduledDate)}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {order.quoteId?.totalAmount != null && (
                  <span className="text-sm font-semibold text-emerald-400">{formatCurrency(order.quoteId.totalAmount)}</span>
                )}
                {order.status && STATUS_CONFIG[order.status] && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[order.status].cls}`}>
                    {STATUS_CONFIG[order.status].label}
                  </span>
                )}
                <span className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Ver →</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setSelected(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
              style={{ background: 'linear-gradient(135deg, #0d1530 0%, #0a1428 100%)' }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelected(null)}
                className="absolute right-4 top-4 text-white/30 hover:text-white/70 transition-colors">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 pr-8">
                <ClipboardList className="h-5 w-5 text-orange-400" />
                Ordem #{selected._id.slice(-6).toUpperCase()}
              </h2>
              <div className="space-y-1">
                <ODetailRow label="Cliente" value={selected.clientId?.name} sub={selected.clientId?.email} />
                <ODetailRow label="Prestador" value={selected.providerId?.name} sub={selected.providerId?.email} />
                <ODetailRow label="Status">
                  {selected.status && STATUS_CONFIG[selected.status] && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selected.status].cls}`}>
                      {STATUS_CONFIG[selected.status].label}
                    </span>
                  )}
                </ODetailRow>
                {selected.quoteId && (
                  <>
                    <ODetailRow label="Valor total" value={formatCurrency(selected.quoteId.totalAmount)} />
                    <ODetailRow label="Depósito" value={formatCurrency(selected.quoteId.depositAmount)} />
                    <ODetailRow label="Restante" value={formatCurrency(selected.quoteId.remainingAmount)} />
                  </>
                )}
                <ODetailRow label="Agendado para" value={selected.scheduledDate ? formatDateTime(selected.scheduledDate) : undefined} />
                <ODetailRow label="Iniciado em" value={selected.startedAt ? formatDateTime(selected.startedAt) : undefined} />
                <ODetailRow label="Concluído em" value={selected.completedAt ? formatDateTime(selected.completedAt) : undefined} />
                <ODetailRow label="Criado em" value={formatDateTime(selected.createdAt)} />
                {selected.notes && <ODetailRow label="Observações" value={selected.notes} />}
                {(selected.beforePhotos?.length ?? 0) > 0 && (
                  <ODetailRow label="Fotos antes" value={`${selected.beforePhotos!.length} foto(s)`} />
                )}
                {(selected.afterPhotos?.length ?? 0) > 0 && (
                  <ODetailRow label="Fotos depois" value={`${selected.afterPhotos!.length} foto(s)`} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ODetailRowProps {
  label: string;
  value?: string;
  sub?: string;
  children?: ReactNode;
}

function ODetailRow({ label, value, sub, children }: ODetailRowProps) {
  if (!value && !children) return null;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
      <p className="text-white/35 w-32 shrink-0 text-xs pt-0.5">{label}</p>
      <div className="flex-1 min-w-0">
        {children ?? <p className="text-white/80 text-sm">{value}</p>}
        {sub && <p className="text-white/35 text-xs">{sub}</p>}
      </div>
    </div>
  );
}
