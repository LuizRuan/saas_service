import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Calendar, ArrowRight,
  AlertCircle, Flame, Wind, Leaf, Clock,
} from 'lucide-react';
import { serviceRequestService } from '@/services/serviceRequest.service';
import type { Category, ServiceRequest } from '@/types';
import { formatDate } from '@/lib/utils';
import { fadeUp } from '@/lib/animations';

const URGENCY: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  low:    { label: 'Baixa',  icon: Leaf,  cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: 'Média',  icon: Wind,  cls: 'text-amber-400   bg-amber-500/10   border-amber-500/20'  },
  high:   { label: 'Alta',   icon: Flame, cls: 'text-red-400     bg-red-500/10     border-red-500/20'    },
};

export function AvailableRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (p: number) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const result = await serviceRequestService.getAvailable(p, 10);
      setRequests(prev => p === 1 ? result.items : [...prev, ...result.items]);
      setHasMore(p < result.pagination.totalPages);
    } catch {
      if (p === 1) setError('Não foi possível carregar os pedidos. Verifique se seu perfil está aprovado.');
    } finally {
      if (p === 1) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const getCategoryName = (categoryId: string | Category) =>
    typeof categoryId === 'object' ? categoryId.name : '—';

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="orb w-72 h-72 bg-indigo-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      <motion.div {...fadeUp(0)} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/20">
            <Search className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <span className="text-xs font-semibold text-indigo-400/80 uppercase tracking-widest">Oportunidades</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Pedidos{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-300">Disponíveis</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {requests.length > 0
            ? `${requests.length} pedido${requests.length !== 1 ? 's' : ''} na sua região.`
            : 'Serviços solicitados por clientes na sua região.'}
        </p>
      </motion.div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-white/5 p-5 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex gap-2 mb-3"><div className="h-5 w-14 bg-white/8 rounded-full" /><div className="h-5 w-10 bg-white/5 rounded-full" /></div>
              <div className="h-4 bg-white/8 rounded-lg w-1/3 mb-2" />
              <div className="h-3 bg-white/5 rounded-lg w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <motion.div {...fadeUp(0)} className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] p-4">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">{error}</p>
        </motion.div>
      )}

      {!loading && !error && requests.length === 0 && (
        <motion.div {...fadeUp(0)} className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/8 mb-4">
            <Search className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="font-semibold text-white/60 mb-1">Nenhum pedido disponível</h3>
          <p className="text-sm text-white/30 max-w-xs mb-5">Não há pedidos nas suas categorias ou cidades. Volte em breve!</p>
          <button
            onClick={() => navigate('/prestador')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white/70 transition-all"
          >
            Voltar ao início
          </button>
        </motion.div>
      )}

      {!loading && !error && requests.length > 0 && (
        <>
        <div className="space-y-3">
          {requests.map((req, i) => {
            const urgencyCfg = URGENCY[req.urgency] ?? URGENCY.medium;
            const UrgencyIcon = urgencyCfg.icon;
            return (
              <motion.div key={req._id} {...fadeUp(i)}>
                <div className="group rounded-2xl border border-white/8 p-5 transition-all duration-300 hover:border-white/15 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border text-blue-400 bg-blue-500/10 border-blue-500/20">
                          <Clock className="h-3 w-3" />Aberta
                        </span>
                        <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${urgencyCfg.cls}`}>
                          <UrgencyIcon className="h-3 w-3" />{urgencyCfg.label} urgência
                        </span>
                      </div>
                      <p className="font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                        {getCategoryName(req.categoryId)}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="flex items-center gap-1 text-xs text-white/35">
                          <MapPin className="h-3 w-3" />{req.city}{req.neighborhood ? ` — ${req.neighborhood}` : ''}
                        </span>
                        {req.desiredDate && (
                          <span className="flex items-center gap-1 text-xs text-white/35">
                            <Calendar className="h-3 w-3" />Desejada: {formatDate(req.desiredDate)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/45 line-clamp-2 leading-relaxed">{req.description}</p>
                    </div>
                    <Link to={`/prestador/pedidos/${req._id}`}
                      className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-indigo-400
                        border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 hover:border-indigo-400/40
                        px-3 py-2 rounded-xl transition-all">
                      Ver pedido<ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
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
