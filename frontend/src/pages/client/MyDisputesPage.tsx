import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { disputeService } from '@/services/dispute.service';
import type { Dispute } from '@/types';
import { fadeUp } from '@/lib/animations';
import { formatDateTime } from '@/lib/utils';

const STATUS_MAP: Record<Dispute['status'], { label: string; cls: string }> = {
  open:              { label: 'Aberta',              cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  under_review:      { label: 'Em análise',           cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  resolved_client:   { label: 'Resolvida (cliente)',  cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  resolved_provider: { label: 'Resolvida (prestador)', cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  refunded:          { label: 'Reembolsada',          cls: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
};

function getOrderId(orderId: Dispute['orderId']): string {
  if (!orderId) return '';
  if (typeof orderId === 'object') return orderId._id ?? '';
  return orderId;
}

export function MyDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDisputes = () => {
    setLoading(true);
    setError('');
    disputeService.getMy()
      .then(setDisputes)
      .catch(() => setError('Não foi possível carregar suas disputas.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDisputes(); }, []);

  return (
    <div className="relative max-w-3xl mx-auto space-y-6">
      <div className="orb w-64 h-64 bg-red-500 -top-20 -right-20 opacity-8 pointer-events-none" />

      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/20">
            <ShieldAlert className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Minhas Disputas</h1>
            <p className="text-xs text-white/35">Reclamações abertas sobre serviços</p>
          </div>
        </div>
        <button
          onClick={fetchDisputes}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white/80 hover:border-white/20 transition-all disabled:opacity-40"
          aria-label="Atualizar disputas"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </motion.div>

      {error && (
        <motion.div {...fadeUp(0)} className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </motion.div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-5 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && disputes.length === 0 && (
        <motion.div {...fadeUp(0.05)}
          className="rounded-2xl border border-white/5 p-10 flex flex-col items-center text-center gap-3"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <ShieldAlert className="h-10 w-10 text-white/20" />
          <p className="text-white/40 text-sm">Nenhuma disputa aberta.</p>
          <p className="text-xs text-white/25">Disputas aparecem quando você abre uma reclamação em uma ordem.</p>
        </motion.div>
      )}

      {!loading && disputes.map((d, i) => {
        const cfg = STATUS_MAP[d.status] ?? STATUS_MAP.open;
        const orderId = getOrderId(d.orderId);
        return (
          <motion.div key={d._id} {...fadeUp(0.05 + i * 0.04)}
            className="rounded-2xl border border-white/8 p-5 space-y-3"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white text-sm">{d.reason}</p>
                <p className="text-xs text-white/35 mt-0.5">{formatDateTime(d.createdAt)}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${cfg.cls}`}>
                {cfg.label}
              </span>
            </div>
            {d.description && (
              <p className="text-sm text-white/50 leading-relaxed line-clamp-2">{d.description}</p>
            )}
            {d.adminNotes && (
              <div className="rounded-xl border border-blue-500/15 bg-blue-500/8 p-3">
                <p className="text-xs font-semibold text-blue-400/70 mb-1">Nota do administrador</p>
                <p className="text-xs text-blue-300/70">{d.adminNotes}</p>
              </div>
            )}
            {orderId && (
              <Link to={`/cliente/ordens/${orderId}`}
                className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors">
                <ExternalLink className="h-3 w-3" /> Ver ordem #{orderId.slice(-6).toUpperCase()}
              </Link>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
