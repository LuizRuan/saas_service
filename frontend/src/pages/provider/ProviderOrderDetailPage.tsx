import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, ArrowLeft, AlertCircle,
  Play, CheckCircle2, Loader2, Calendar, Clock, Info,
} from 'lucide-react';
import { orderService } from '@/services/order.service';
import { fadeUp } from '@/lib/animations';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const ORDER_STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  created:          { label: 'Aguardando sinal',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  scheduled:        { label: 'Agendada',            cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  in_progress:      { label: 'Em andamento',        cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  waiting_approval: { label: 'Aguard. aprovação',   cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  completed:        { label: 'Concluída',            cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelada',            cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

export function ProviderOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    orderService.getById(id)
      .then(setOrder)
      .catch(() => setError('Não foi possível carregar os detalhes da ordem.'))
      .finally(() => setLoading(false));
  }, [id, reloadKey]);

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    setActionLoading(status);
    setActionError('');
    try {
      await orderService.updateStatus(id, status);
      setReloadKey(n => n + 1);
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? '';
      if (msg.toLowerCase().includes('deposit')) {
        setActionError('O cliente ainda não pagou o sinal. Aguarde o pagamento para iniciar o serviço.');
      } else {
        setActionError('Não foi possível atualizar o status da ordem.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const statusCfg = order ? (ORDER_STATUS[order.status] ?? ORDER_STATUS.created) : null;
  const quote = order && typeof order.quoteId === 'object' ? order.quoteId : null;
  const sr = order && typeof order.serviceRequestId === 'object' ? order.serviceRequestId : null;
  const client = order && typeof order.clientId === 'object' ? order.clientId : null;
  const totalAmount = quote?.totalAmount ?? order?.totalAmount ?? 0;

  return (
    <div className="relative max-w-3xl mx-auto space-y-6">
      <div className="orb w-72 h-72 bg-orange-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      {/* Back */}
      <motion.div {...fadeUp(0)}>
        <Link to="/prestador/ordens" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Minhas Ordens
        </Link>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-6 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
              <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <motion.div {...fadeUp(0)} className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={() => setReloadKey(n => n + 1)} className="text-xs text-red-400/70 hover:text-red-300 mt-1 transition-colors">
              Tentar novamente
            </button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {!loading && !error && order && (
        <>
          {/* Header */}
          <motion.div {...fadeUp(0)} className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/20">
                <ClipboardList className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">#{order._id.slice(-6).toUpperCase()}</h1>
                <p className="text-xs text-white/35 mt-0.5">{formatDateTime(order.createdAt)}</p>
              </div>
            </div>
            {statusCfg && (
              <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border ${statusCfg.cls} shrink-0`}>
                {statusCfg.label}
              </span>
            )}
          </motion.div>

          {/* Deposit paid info (when scheduled) */}
          {order.status === 'scheduled' && (
            <motion.div {...fadeUp(0.05)} className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
              <Info className="h-4 w-4 text-blue-400 shrink-0" />
              <p className="text-xs text-blue-300">O cliente pagou o sinal. Você pode iniciar o serviço.</p>
            </motion.div>
          )}

          {/* Action error */}
          {actionError && (
            <motion.div {...fadeUp(0)} className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{actionError}</p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div {...fadeUp(0.1)} className="flex flex-wrap gap-3">
            {order.status === 'scheduled' && (
              <button
                onClick={() => handleUpdateStatus('in_progress')}
                disabled={actionLoading === 'in_progress'}
                className="flex items-center gap-2 rounded-xl bg-orange-600/20 border border-orange-500/30 hover:bg-orange-600/30 text-orange-400 text-sm font-semibold px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'in_progress' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Iniciar serviço
              </button>
            )}
            {order.status === 'in_progress' && (
              <button
                onClick={() => handleUpdateStatus('waiting_approval')}
                disabled={actionLoading === 'waiting_approval'}
                className="flex items-center gap-2 rounded-xl bg-yellow-600/20 border border-yellow-500/30 hover:bg-yellow-600/30 text-yellow-400 text-sm font-semibold px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'waiting_approval' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Marcar como aguardando aprovação
              </button>
            )}
          </motion.div>

          {/* Client info */}
          {client && (
            <motion.div {...fadeUp(0.15)} className="rounded-2xl border border-white/5 p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Cliente</p>
              <InfoRow label="Nome" value={(client as any).name ?? '—'} />
              {(client as any).phone && <InfoRow label="Telefone" value={(client as any).phone} />}
            </motion.div>
          )}

          {/* Service info */}
          {sr && (
            <motion.div {...fadeUp(0.2)} className="rounded-2xl border border-white/5 p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Serviço</p>
              <InfoRow label="Descrição" value={(sr as any).description ?? '—'} />
              {(sr as any).city && <InfoRow label="Cidade" value={(sr as any).city} />}
              {(sr as any).approximateAddress && <InfoRow label="Endereço" value={(sr as any).approximateAddress} />}
              {(sr as any).urgency && <InfoRow label="Urgência" value={(sr as any).urgency} />}
            </motion.div>
          )}

          {/* Quote info */}
          {quote && (
            <motion.div {...fadeUp(0.25)} className="rounded-2xl border border-white/5 p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Orçamento</p>
              <InfoRow label="Valor total" value={formatCurrency(totalAmount)} />
              <InfoRow label="Sinal (20%)" value={formatCurrency(quote.depositAmount ?? 0)} />
              <InfoRow label="Restante (80%)" value={formatCurrency(quote.remainingAmount ?? 0)} />
              {quote.estimatedTime && <InfoRow label="Prazo estimado" value={quote.estimatedTime} />}
              {quote.warrantyDays != null && <InfoRow label="Garantia" value={`${quote.warrantyDays} dias`} />}
              {quote.description && <InfoRow label="Observações" value={quote.description} />}
            </motion.div>
          )}

          {/* Dates */}
          <motion.div {...fadeUp(0.3)} className="rounded-2xl border border-white/5 p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Linha do tempo</p>
            <InfoRow label="Criada em">
              <span className="flex items-center gap-1 text-sm text-white/80">
                <Calendar className="h-3.5 w-3.5 text-white/40" />{formatDateTime(order.createdAt)}
              </span>
            </InfoRow>
            {order.scheduledDate && (
              <InfoRow label="Agendada para">
                <span className="flex items-center gap-1 text-sm text-white/80">
                  <Clock className="h-3.5 w-3.5 text-white/40" />{formatDate(order.scheduledDate)}
                </span>
              </InfoRow>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}

interface InfoRowProps { label: string; value?: string; children?: ReactNode }

function InfoRow({ label, value, children }: InfoRowProps) {
  if (!value && !children) return null;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
      <p className="text-white/35 w-32 shrink-0 text-xs pt-0.5">{label}</p>
      <div className="flex-1 min-w-0">
        {children ?? <p className="text-white/80 text-sm break-words">{value}</p>}
      </div>
    </div>
  );
}
