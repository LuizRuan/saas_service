import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, AlertCircle, X, DollarSign, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type { AdminPayment } from '@/services/admin.service';
import { fadeUp } from '@/lib/animations';
import { formatDateTime, formatCurrency } from '@/lib/utils';

const TYPE_CONFIG: Record<string, { label: string; cls: string }> = {
  deposit:   { label: 'Sinal',    cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  remaining: { label: 'Restante', cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  full:      { label: 'Total',    cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

const GATEWAY_CONFIG: Record<string, { label: string; cls: string }> = {
  simulated:    { label: 'Simulado',     cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  mercado_pago: { label: 'Mercado Pago', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  asaas:        { label: 'Asaas',        cls: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  pagarme:      { label: 'Pagar.me',     cls: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Pendente',    cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  paid:     { label: 'Pago',        cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  refunded: { label: 'Reembolsado', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  failed:   { label: 'Falhou',      cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

function clientName(p: AdminPayment): string {
  return typeof p.clientId === 'object' && p.clientId ? p.clientId.name : '—';
}

function clientEmail(p: AdminPayment): string {
  return typeof p.clientId === 'object' && p.clientId ? p.clientId.email : '';
}

function providerName(p: AdminPayment): string {
  return typeof p.providerId === 'object' && p.providerId ? p.providerId.name : '—';
}

function providerEmail(p: AdminPayment): string {
  return typeof p.providerId === 'object' && p.providerId ? p.providerId.email : '';
}

function orderStatus(p: AdminPayment): string {
  return typeof p.orderId === 'object' && p.orderId ? (p.orderId.status ?? '—') : '—';
}

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<AdminPayment | null>(null);

  useEffect(() => {
    setLoading(true);
    adminService.getPayments(200)
      .then(({ payments, total }) => { setPayments(payments); setTotal(total); })
      .catch(() => setError('Não foi possível carregar os pagamentos.'))
      .finally(() => setLoading(false));
  }, []);

  const paid = payments.filter(p => p.status === 'paid');
  const pending = payments.filter(p => p.status === 'pending');
  const totalMovimentado = paid.reduce((sum, p) => sum + p.amount, 0);
  const totalTaxa = paid.reduce((sum, p) => sum + p.platformFee, 0);
  const totalPrestadores = paid.reduce((sum, p) => sum + p.providerAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-green-400" /> Pagamentos
            </h1>
            <p className="text-sm text-white/40 mt-1 max-w-xl">
              Acompanhe os pagamentos simulados da plataforma. Integrações reais com gateways serão adicionadas futuramente.
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 mt-1">
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

      {/* Summary cards */}
      {!loading && !error && (
        <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <SummaryCard icon={<DollarSign className="h-4 w-4 text-green-400" />} label="Total movimentado" value={formatCurrency(totalMovimentado)} />
          <SummaryCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} label="Pagamentos pagos" value={String(paid.length)} />
          <SummaryCard icon={<Clock className="h-4 w-4 text-amber-400" />} label="Pendentes" value={String(pending.length)} />
          <SummaryCard icon={<TrendingUp className="h-4 w-4 text-violet-400" />} label="Taxa plataforma" value={formatCurrency(totalTaxa)} />
          <SummaryCard icon={<CreditCard className="h-4 w-4 text-blue-400" />} label="Valor prestadores" value={formatCurrency(totalPrestadores)} />
        </motion.div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
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
      ) : payments.length === 0 ? (
        <motion.div {...fadeUp(0.1)} className="text-center py-20">
          <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
            <CreditCard className="h-8 w-8 text-white/20" />
          </div>
          <p className="text-white/50 font-medium mb-2">Nenhum pagamento registrado ainda.</p>
          <p className="text-white/25 text-sm max-w-sm mx-auto">
            Quando clientes realizarem pagamentos simulados de sinal ou restante, eles aparecerão nesta área para acompanhamento administrativo.
          </p>
        </motion.div>
      ) : (
        <motion.div {...fadeUp(0.1)} className="space-y-2">
          <p className="text-xs text-white/30 mb-3">{total} pagamento{total !== 1 ? 's' : ''} no total</p>
          {payments.map((p, i) => (
            <motion.div key={p._id} {...fadeUp(0.05 + i * 0.01)}
              className="flex items-center gap-4 rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.02)' }}
              onClick={() => setSelected(p)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/5">
                <CreditCard className="h-5 w-5 text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  #{p._id.slice(-6).toUpperCase()}
                </p>
                <p className="text-xs text-white/35 truncate">
                  {clientName(p)} → {providerName(p)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <span className="text-sm font-bold text-white">{formatCurrency(p.amount)}</span>
                {TYPE_CONFIG[p.type] && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_CONFIG[p.type].cls}`}>
                    {TYPE_CONFIG[p.type].label}
                  </span>
                )}
                {GATEWAY_CONFIG[p.gateway] && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${GATEWAY_CONFIG[p.gateway].cls}`}>
                    {GATEWAY_CONFIG[p.gateway].label}
                  </span>
                )}
                {STATUS_CONFIG[p.status] && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[p.status].cls}`}>
                    {STATUS_CONFIG[p.status].label}
                  </span>
                )}
                <span className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Ver →</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
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
                <CreditCard className="h-5 w-5 text-green-400" />
                Pagamento #{selected._id.slice(-6).toUpperCase()}
              </h2>

              {selected.gateway === 'simulated' && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-300">Este pagamento é simulado e não representa uma transação financeira real.</p>
                </div>
              )}

              <div className="space-y-1">
                <PRow label="ID completo" value={selected._id} />
                <PRow label="Ordem (status)" value={orderStatus(selected)} />
                <PRow label="Cliente" value={clientName(selected)} sub={clientEmail(selected)} />
                <PRow label="Prestador" value={providerName(selected)} sub={providerEmail(selected)} />
                <PRow label="Tipo">
                  {TYPE_CONFIG[selected.type] && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_CONFIG[selected.type].cls}`}>
                      {TYPE_CONFIG[selected.type].label}
                    </span>
                  )}
                </PRow>
                <PRow label="Valor" value={formatCurrency(selected.amount)} />
                <PRow label="Taxa plataforma" value={formatCurrency(selected.platformFee)} />
                <PRow label="Valor prestador" value={formatCurrency(selected.providerAmount)} />
                <PRow label="Gateway">
                  {GATEWAY_CONFIG[selected.gateway] && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${GATEWAY_CONFIG[selected.gateway].cls}`}>
                      {GATEWAY_CONFIG[selected.gateway].label}
                    </span>
                  )}
                </PRow>
                {selected.externalPaymentId && (
                  <PRow label="ID externo" value={selected.externalPaymentId} />
                )}
                <PRow label="Status">
                  {STATUS_CONFIG[selected.status] && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selected.status].cls}`}>
                      {STATUS_CONFIG[selected.status].label}
                    </span>
                  )}
                </PRow>
                <PRow label="Criado em" value={formatDateTime(selected.createdAt)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex items-center gap-2 mb-2">{icon}<p className="text-xs text-white/35">{label}</p></div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

interface PRowProps {
  label: string;
  value?: string;
  sub?: string;
  children?: ReactNode;
}

function PRow({ label, value, sub, children }: PRowProps) {
  if (!value && !children) return null;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
      <p className="text-white/35 w-32 shrink-0 text-xs pt-0.5">{label}</p>
      <div className="flex-1 min-w-0">
        {children ?? <p className="text-white/80 text-sm break-all">{value}</p>}
        {sub && <p className="text-white/35 text-xs">{sub}</p>}
      </div>
    </div>
  );
}
