import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Plus, MapPin, Calendar, ArrowRight,
  AlertCircle, Zap, Clock,
} from 'lucide-react';
import { serviceRequestService } from '@/services/serviceRequest.service';
import type { Category, ServiceRequest } from '@/types';
import { formatDate } from '@/lib/utils';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as const },
});

const URGENCY: Record<string, { label: string; cls: string }> = {
  low:    { label: 'Baixa',  cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: 'Média',  cls: 'text-amber-400   bg-amber-500/10   border-amber-500/20'  },
  high:   { label: 'Alta',   cls: 'text-red-400     bg-red-500/10     border-red-500/20'    },
};

const STATUS: Record<string, { label: string; cls: string }> = {
  open:      { label: 'Aberta',      cls: 'text-blue-400   bg-blue-500/10   border-blue-500/20'   },
  quoted:    { label: 'Orçada',      cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  scheduled: { label: 'Agendada',    cls: 'text-cyan-400   bg-cyan-500/10   border-cyan-500/20'   },
  completed: { label: 'Concluída',   cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled: { label: 'Cancelada',   cls: 'text-red-400    bg-red-500/10    border-red-500/20'    },
};

export function MyRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    serviceRequestService
      .getMy()
      .then(setRequests)
      .catch(() => setError('Não foi possível carregar suas solicitações.'))
      .finally(() => setLoading(false));
  }, []);

  const getCategoryName = (categoryId: string | Category) =>
    typeof categoryId === 'object' ? categoryId.name : '—';

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="orb w-72 h-72 bg-blue-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      {/* Header */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/20">
            <FileText className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <span className="text-xs font-semibold text-blue-400/80 uppercase tracking-widest">Marketplace</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Minhas{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                Solicitações
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {requests.length > 0
                ? `${requests.length} solicitaç${requests.length === 1 ? 'ão' : 'ões'} encontrada${requests.length === 1 ? '' : 's'}.`
                : 'Publique seus pedidos e receba orçamentos.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/cliente/solicitacoes/nova')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30
              hover:bg-emerald-600/30 text-emerald-400 text-sm font-semibold px-4 py-2.5 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Solicitação</span>
          </button>
        </div>
      </motion.div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/5 p-5 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-16 bg-white/8 rounded-full" />
                <div className="h-5 w-12 bg-white/5 rounded-full" />
              </div>
              <div className="h-4 bg-white/8 rounded-lg w-1/3 mb-2" />
              <div className="h-3 bg-white/5 rounded-lg w-2/3 mb-2" />
              <div className="h-3 bg-white/5 rounded-lg w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <motion.div {...fadeUp(0)}
          className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Empty */}
      {!loading && !error && requests.length === 0 && (
        <motion.div {...fadeUp(0)}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/8 mb-4">
            <FileText className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="font-semibold text-white/60 mb-1">Nenhuma solicitação ainda</h3>
          <p className="text-sm text-white/30 max-w-xs mb-5">
            Publique o serviço que você precisa e receba orçamentos de prestadores verificados.
          </p>
          <button
            onClick={() => navigate('/cliente/solicitacoes/nova')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30
              hover:bg-emerald-600/30 text-emerald-400 text-sm font-semibold px-4 py-2.5 transition-all"
          >
            <Zap className="h-4 w-4" />
            Publicar meu primeiro serviço
          </button>
        </motion.div>
      )}

      {/* List */}
      {!loading && !error && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((req, i) => {
            const statusCfg = STATUS[req.status] ?? STATUS.open;
            const urgencyCfg = URGENCY[req.urgency] ?? URGENCY.medium;
            return (
              <motion.div key={req._id} {...fadeUp(i)}>
                <Link
                  to={`/cliente/solicitacoes/${req._id}`}
                  className="group block rounded-2xl border border-white/8 p-5 transition-all duration-300
                    hover:border-white/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusCfg.cls}`}>
                      <Clock className="h-3 w-3" />
                      {statusCfg.label}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${urgencyCfg.cls}`}>
                      {urgencyCfg.label}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                        {getCategoryName(req.categoryId)}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 mb-2">
                        <span className="flex items-center gap-1 text-xs text-white/35">
                          <MapPin className="h-3 w-3" />
                          {req.city}{req.neighborhood ? ` — ${req.neighborhood}` : ''}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white/35">
                          <Calendar className="h-3 w-3" />
                          {formatDate(req.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-white/45 line-clamp-2 leading-relaxed">{req.description}</p>
                    </div>

                    <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-xl border border-white/8
                      group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all">
                      <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
