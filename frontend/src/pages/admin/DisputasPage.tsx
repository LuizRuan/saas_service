import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertCircle, X, ChevronDown } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type { AdminDispute, DisputeStatus } from '@/services/admin.service';
import { fadeUp } from '@/lib/animations';
import { formatDate, formatDateTime } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  open:              { label: 'Aberta',               cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  under_review:      { label: 'Em análise',            cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  resolved_client:   { label: 'Resolvido (cliente)',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  resolved_provider: { label: 'Resolvido (prestador)', cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  refunded:          { label: 'Reembolsado',           cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

const STATUS_OPTIONS: { value: DisputeStatus; label: string }[] = [
  { value: 'open', label: 'Aberta' },
  { value: 'under_review', label: 'Em análise' },
  { value: 'resolved_client', label: 'Resolvido (cliente)' },
  { value: 'resolved_provider', label: 'Resolvido (prestador)' },
  { value: 'refunded', label: 'Reembolsado' },
];

interface DisputeCardProps {
  d: AdminDispute;
  i: number;
  onOpen: (d: AdminDispute) => void;
}

function DisputeCard({ d, i, onOpen }: DisputeCardProps) {
  return (
    <motion.div {...fadeUp(0.05 + i * 0.02)}
      className="rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.02)' }}
      onClick={() => onOpen(d)}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate">{d.reason}</p>
          <p className="text-xs text-white/35 truncate">{d.openedBy?.name ?? '—'} · {formatDate(d.createdAt)}</p>
        </div>
        <span className={`flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[d.status]?.cls ?? ''}`}>
          {STATUS_CONFIG[d.status]?.label ?? d.status}
        </span>
      </div>
      {d.description && (
        <p className="text-xs text-white/30 line-clamp-2 mb-2">{d.description}</p>
      )}
      <p className="text-[11px] text-white/30 hover:text-white/60 transition-colors text-right">Ver detalhes →</p>
    </motion.div>
  );
}

interface DDetailRowProps {
  label: string;
  value?: string;
  sub?: string;
  children?: ReactNode;
}

function DDetailRow({ label, value, sub, children }: DDetailRowProps) {
  if (!value && !children) return null;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
      <p className="text-white/35 w-28 shrink-0 text-xs pt-0.5">{label}</p>
      <div className="flex-1 min-w-0">
        {children ?? <p className="text-white/80 text-sm">{value}</p>}
        {sub && <p className="text-white/35 text-xs">{sub}</p>}
      </div>
    </div>
  );
}

export function AdminDisputasPage() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<AdminDispute | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<DisputeStatus>('open');
  const [adminNotes, setAdminNotes] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    setLoading(true);
    adminService.getDisputes(200)
      .then(({ disputes, total }) => { setDisputes(disputes); setTotal(total); })
      .catch(() => setError('Não foi possível carregar as disputas.'))
      .finally(() => setLoading(false));
  }, []);

  const openModal = (d: AdminDispute) => {
    setSelected(d);
    setNewStatus(d.status);
    setAdminNotes(d.adminNotes ?? '');
    setUpdateError('');
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdating(true);
    setUpdateError('');
    try {
      await adminService.updateDisputeStatus(selected._id, newStatus, adminNotes || undefined);
      setDisputes(prev => prev.map(d => d._id === selected._id ? { ...d, status: newStatus, adminNotes: adminNotes || undefined } : d));
      setSelected(prev => prev ? { ...prev, status: newStatus, adminNotes: adminNotes || undefined } : null);
    } catch {
      setUpdateError('Não foi possível atualizar a disputa.');
    } finally {
      setUpdating(false);
    }
  };

  const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'under_review');
  const resolvedDisputes = disputes.filter(d => d.status !== 'open' && d.status !== 'under_review');

  const isSaveDisabled = updating ||
    (newStatus === selected?.status && adminNotes === (selected?.adminNotes ?? ''));

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-400" /> Disputas
          </h1>
          <p className="text-sm text-white/40 mt-1">{total} disputa{total !== 1 ? 's' : ''} no total</p>
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
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="h-4 bg-white/5 rounded w-1/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhuma disputa registrada.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {openDisputes.length > 0 && (
            <motion.div {...fadeUp(0.1)}>
              <p className="text-xs font-semibold text-red-400/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5" /> Abertas / Em análise ({openDisputes.length})
              </p>
              <div className="space-y-2">
                {openDisputes.map((d, i) => <DisputeCard key={d._id} d={d} i={i} onOpen={openModal} />)}
              </div>
            </motion.div>
          )}
          {resolvedDisputes.length > 0 && (
            <motion.div {...fadeUp(0.15)}>
              {openDisputes.length > 0 && (
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Resolvidas ({resolvedDisputes.length})</p>
              )}
              <div className="space-y-2">
                {resolvedDisputes.map((d, i) => <DisputeCard key={d._id} d={d} i={i} onOpen={openModal} />)}
              </div>
            </motion.div>
          )}
        </div>
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
                <ShieldAlert className="h-5 w-5 text-red-400" />
                Detalhe da Disputa
              </h2>
              <div className="space-y-1 mb-6">
                <DDetailRow label="Aberta por" value={selected.openedBy?.name} sub={selected.openedBy?.email} />
                <DDetailRow label="Motivo" value={selected.reason} />
                <DDetailRow label="Status atual">
                  {STATUS_CONFIG[selected.status] && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selected.status].cls}`}>
                      {STATUS_CONFIG[selected.status].label}
                    </span>
                  )}
                </DDetailRow>
                <DDetailRow label="Criado em" value={formatDateTime(selected.createdAt)} />
                {(selected.evidencePhotos?.length ?? 0) > 0 && (
                  <DDetailRow label="Evidências" value={`${selected.evidencePhotos!.length} foto(s) anexada(s)`} />
                )}
              </div>

              {selected.description && (
                <div className="mb-4">
                  <p className="text-xs text-white/30 mb-2">Descrição completa</p>
                  <p className="text-white/70 text-sm rounded-xl border border-white/10 bg-white/5 p-3 leading-relaxed">
                    {selected.description}
                  </p>
                </div>
              )}

              {selected.adminNotes && (
                <div className="mb-4">
                  <p className="text-xs text-white/30 mb-2">Notas admin atuais</p>
                  <p className="text-white/50 text-sm rounded-xl border border-white/10 bg-white/5 p-3">{selected.adminNotes}</p>
                </div>
              )}

              <div className="border-t border-white/10 pt-4 space-y-3">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Atualizar disputa</p>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as DisputeStatus)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-9
                      text-sm text-white outline-none focus:border-red-500/50 transition-all appearance-none cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {STATUS_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} style={{ background: '#0d1530' }}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Observações administrativas (opcional)..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3
                    text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-all resize-none"
                />
                {updateError && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {updateError}
                  </p>
                )}
                <button
                  onClick={handleUpdate}
                  disabled={isSaveDisabled}
                  className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold
                    text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {updating ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
