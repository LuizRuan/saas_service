import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, ArrowRight } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import type { Payment } from '@/services/payment.service';
import { fadeUp } from '@/lib/animations';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const TYPE_CONFIG: Record<string, { label: string; cls: string }> = {
  deposit:   { label: 'Sinal',    cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  remaining: { label: 'Restante', cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  full:      { label: 'Total',    cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Pendente',    cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  paid:     { label: 'Pago',        cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  refunded: { label: 'Reembolsado', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  failed:   { label: 'Falhou',      cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

function getPaymentOrderId(orderId: Payment['orderId']): string {
  if (!orderId) return '';
  if (typeof orderId === 'object') return orderId._id ?? '';
  return orderId;
}

export function ClientPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    paymentService.getMy()
      .then(setPayments)
      .catch(() => setError('Não foi possível carregar seus pagamentos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative max-w-4xl mx-auto space-y-6">
      <div className="orb w-72 h-72 bg-green-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/20">
            <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-emerald-400/80 uppercase tracking-widest">Financeiro</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Meus <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-300">Pagamentos</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Histórico de pagamentos simulados realizados.</p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 shrink-0">
            MVP Simulado
          </span>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-2.5 bg-white/5 rounded w-1/3" />
                </div>
                <div className="h-5 w-16 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && payments.length === 0 && (
        <motion.div {...fadeUp(0)} className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
            <CreditCard className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="font-semibold text-white/60 mb-1">Nenhum pagamento realizado ainda.</h3>
          <p className="text-sm text-white/30 max-w-xs mb-5">
            Quando você pagar o sinal ou restante de uma ordem, os registros aparecerão aqui.
          </p>
          <Link
            to="/cliente/ordens"
            className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Ver minhas ordens <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}

      {/* List */}
      {!loading && !error && payments.length > 0 && (
        <motion.div {...fadeUp(0.05)} className="space-y-2">
          <p className="text-xs text-white/30 mb-3">{payments.length} pagamento{payments.length !== 1 ? 's' : ''}</p>
          {payments.map((p, i) => {
            const orderId = getPaymentOrderId(p.orderId);
            const typeCfg = TYPE_CONFIG[p.type];
            const statusCfg = STATUS_CONFIG[p.status];
            return (
              <motion.div key={p._id} {...fadeUp(0.05 + i * 0.01)}>
                {orderId ? (
                  <Link
                    to={`/cliente/ordens/${orderId}`}
                    className="flex items-center gap-4 rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <PaymentCardContent p={p} typeCfg={typeCfg} statusCfg={statusCfg} />
                  </Link>
                ) : (
                  <div
                    className="flex items-center gap-4 rounded-2xl border border-white/5 p-4"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <PaymentCardContent p={p} typeCfg={typeCfg} statusCfg={statusCfg} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

interface CfgItem { label: string; cls: string }

function PaymentCardContent({ p, typeCfg, statusCfg }: { p: Payment; typeCfg?: CfgItem; statusCfg?: CfgItem }) {
  return (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-white/5">
        <CreditCard className="h-5 w-5 text-white/50" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">#{p._id.slice(-6).toUpperCase()}</p>
        <p className="text-xs text-white/35">{formatDateTime(p.createdAt)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        <span className="text-sm font-bold text-white">{formatCurrency(p.amount)}</span>
        {typeCfg && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeCfg.cls}`}>{typeCfg.label}</span>
        )}
        {statusCfg && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.cls}`}>{statusCfg.label}</span>
        )}
      </div>
    </>
  );
}
