import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Search, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '@/lib/axios';
import { fadeUp } from '@/lib/animations';
import { formatDate } from '@/lib/utils';

interface AdminProvider {
  _id: string;
  professionalName: string;
  status: 'pending' | 'approved' | 'blocked';
  plan: string;
  cities: string[];
  averageRating: number;
  totalReviews: number;
  completedServices: number;
  createdAt: string;
  userId?: { name: string; email: string };
  categories?: { name: string }[];
}

const STATUS_CONFIG = {
  pending:  { label: 'Pendente',  cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20',     icon: Clock },
  approved: { label: 'Aprovado',  cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  blocked:  { label: 'Bloqueado', cls: 'text-red-400 bg-red-500/10 border-red-500/20',           icon: XCircle },
};

export function AdminProvidersPage() {
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const load = () => {
    setLoading(true);
    api.get('/admin/providers?limit=100')
      .then(res => {
        setProviders(res.data.data.providers ?? res.data.data ?? []);
        setTotal(res.data.data.total ?? res.data.data?.length ?? 0);
      })
      .catch(() => setError('Não foi possível carregar os prestadores.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id + '-approve');
    try {
      await api.patch(`/admin/providers/${id}/approve`);
      setProviders(prev => prev.map(p => p._id === id ? { ...p, status: 'approved' } : p));
    } catch {
      setError('Não foi possível aprovar o prestador.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async (id: string) => {
    setActionLoading(id + '-block');
    try {
      await api.patch(`/admin/providers/${id}/block`);
      setProviders(prev => prev.map(p => p._id === id ? { ...p, status: 'blocked' } : p));
    } catch {
      setError('Não foi possível bloquear o prestador.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = providers.filter(p =>
    (p.professionalName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.userId?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.userId?.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const pending = filtered.filter(p => p.status === 'pending');
  const others = filtered.filter(p => p.status !== 'pending');

  const ProviderCard = ({ p }: { p: AdminProvider }) => {
    const StatusIcon = STATUS_CONFIG[p.status]?.icon ?? Clock;
    return (
      <div className="rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{p.professionalName || p.userId?.name || '—'}</p>
            <p className="text-xs text-white/35 truncate">{p.userId?.email}</p>
            {p.cities?.length > 0 && (
              <p className="text-xs text-white/25 mt-0.5">{p.cities.slice(0, 3).join(', ')}</p>
            )}
          </div>
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_CONFIG[p.status]?.cls}`}>
            <StatusIcon className="h-3 w-3" />
            {STATUS_CONFIG[p.status]?.label}
          </span>
        </div>

        {p.categories && p.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {p.categories.slice(0, 4).map(c => (
              <span key={c.name} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/40">
                {c.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-white/25">Cadastro: {formatDate(p.createdAt)}</p>
          <div className="flex gap-2">
            {p.status !== 'approved' && (
              <button
                onClick={() => handleApprove(p._id)}
                disabled={actionLoading === p._id + '-approve'}
                className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg
                  bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                  hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                <CheckCircle2 className="h-3 w-3" />
                {actionLoading === p._id + '-approve' ? 'Aprovando...' : 'Aprovar'}
              </button>
            )}
            {p.status !== 'blocked' && (
              <button
                onClick={() => handleBlock(p._id)}
                disabled={actionLoading === p._id + '-block'}
                className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg
                  bg-red-500/10 border border-red-500/20 text-red-400
                  hover:bg-red-500/20 transition-all disabled:opacity-50">
                <XCircle className="h-3 w-3" />
                {actionLoading === p._id + '-block' ? 'Bloqueando...' : 'Bloquear'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-emerald-400" /> Prestadores
          </h1>
          <p className="text-sm text-white/40 mt-1">{total} prestador{total !== 1 ? 'es' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5
            text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-all"
        />
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
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhum prestador encontrado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <motion.div {...fadeUp(0.1)}>
              <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Aguardando aprovação ({pending.length})
              </p>
              <div className="space-y-3">
                {pending.map(p => <ProviderCard key={p._id} p={p} />)}
              </div>
            </motion.div>
          )}
          {others.length > 0 && (
            <motion.div {...fadeUp(0.15)}>
              {pending.length > 0 && (
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Outros ({others.length})</p>
              )}
              <div className="space-y-3">
                {others.map(p => <ProviderCard key={p._id} p={p} />)}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
