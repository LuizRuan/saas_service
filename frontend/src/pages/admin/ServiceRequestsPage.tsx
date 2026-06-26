import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, AlertCircle, X, MapPin, Filter } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type { AdminServiceRequest } from '@/services/admin.service';
import { fadeUp } from '@/lib/animations';
import { formatDate, formatDateTime } from '@/lib/utils';

const URGENCY_CONFIG: Record<string, { label: string; cls: string }> = {
  low:    { label: 'Baixa',  cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  medium: { label: 'Média',  cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  high:   { label: 'Alta',   cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  open:             { label: 'Aberta',            cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  quoted:           { label: 'Orçada',            cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  scheduled:        { label: 'Agendada',           cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  in_progress:      { label: 'Em andamento',       cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  waiting_approval: { label: 'Aguard. aprovação',  cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  completed:        { label: 'Concluída',           cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelada',           cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  dispute:          { label: 'Disputa',             cls: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'open', label: 'Aberta' },
  { value: 'quoted', label: 'Orçada' },
  { value: 'scheduled', label: 'Agendada' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'waiting_approval', label: 'Aguard. aprovação' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'dispute', label: 'Disputa' },
];

export function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<AdminServiceRequest | null>(null);

  useEffect(() => {
    setLoading(true);
    adminService.getServiceRequests(200)
      .then(({ requests, total }) => { setRequests(requests); setTotal(total); })
      .catch(() => setError('Não foi possível carregar as solicitações.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter(r => {
    const matchSearch = !search ||
      (r.clientId?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.clientId?.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.city ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.categoryId?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-violet-400" /> Solicitações
          </h1>
          <p className="text-sm text-white/40 mt-1">{total} solicitaç{total !== 1 ? 'ões' : 'ão'} no total</p>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, categoria ou cidade..."
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5
              text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5
              text-sm text-white outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer"
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
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-2.5 bg-white/5 rounded w-1/3" />
                </div>
                <div className="h-5 w-16 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhuma solicitação encontrada.</p>
        </div>
      ) : (
        <motion.div {...fadeUp(0.1)} className="space-y-2">
          {filtered.map((r, i) => (
            <motion.div key={r._id} {...fadeUp(0.05 + i * 0.015)}
              className="flex items-center gap-4 rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.02)' }}
              onClick={() => setSelected(r)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/5">
                <FileText className="h-5 w-5 text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {r.categoryId?.name ?? '—'} · {r.clientId?.name ?? '—'}
                </p>
                <p className="text-xs text-white/35 truncate flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[r.city, r.neighborhood].filter(Boolean).join(', ') || '—'}
                </p>
                <p className="text-xs text-white/25">{formatDate(r.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {r.urgency && URGENCY_CONFIG[r.urgency] && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${URGENCY_CONFIG[r.urgency].cls}`}>
                    {URGENCY_CONFIG[r.urgency].label}
                  </span>
                )}
                {r.status && STATUS_CONFIG[r.status] && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[r.status].cls}`}>
                    {STATUS_CONFIG[r.status].label}
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
                <FileText className="h-5 w-5 text-violet-400" />
                Detalhe da Solicitação
              </h2>
              <div className="space-y-1">
                <DetailRow label="Categoria" value={selected.categoryId?.name} />
                <DetailRow label="Cliente" value={selected.clientId?.name} sub={selected.clientId?.email} />
                <DetailRow label="Status">
                  {selected.status && STATUS_CONFIG[selected.status] && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selected.status].cls}`}>
                      {STATUS_CONFIG[selected.status].label}
                    </span>
                  )}
                </DetailRow>
                <DetailRow label="Urgência">
                  {selected.urgency && URGENCY_CONFIG[selected.urgency] && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${URGENCY_CONFIG[selected.urgency].cls}`}>
                      {URGENCY_CONFIG[selected.urgency].label}
                    </span>
                  )}
                </DetailRow>
                <DetailRow label="Cidade/Bairro" value={[selected.city, selected.neighborhood].filter(Boolean).join(', ')} />
                <DetailRow label="End. aproximado" value={selected.approximateAddress} />
                <DetailRow label="End. completo" value={selected.fullAddress} />
                <DetailRow label="Data desejada" value={selected.desiredDate ? formatDateTime(selected.desiredDate) : undefined} />
                <DetailRow label="Criado em" value={formatDateTime(selected.createdAt)} />
              </div>
              {selected.description && (
                <div className="mt-4">
                  <p className="text-xs text-white/30 mb-2">Descrição</p>
                  <p className="text-white/70 text-sm rounded-xl border border-white/10 bg-white/5 p-3 leading-relaxed">
                    {selected.description}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value?: string;
  sub?: string;
  children?: ReactNode;
}

function DetailRow({ label, value, sub, children }: DetailRowProps) {
  if (!value && !children) return null;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
      <p className="text-white/35 w-36 shrink-0 text-xs pt-0.5">{label}</p>
      <div className="flex-1 min-w-0">
        {children ?? <p className="text-white/80 text-sm">{value}</p>}
        {sub && <p className="text-white/35 text-xs">{sub}</p>}
      </div>
    </div>
  );
}
