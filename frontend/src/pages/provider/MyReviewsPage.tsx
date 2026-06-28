import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, AlertCircle, MessageSquare } from 'lucide-react';
import { reviewService } from '@/services/review.service';
import type { Review } from '@/types';
import { formatDate } from '@/lib/utils';
import { fadeUp } from '@/lib/animations';

function StarRow({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-white/15'}`}
        />
      ))}
    </span>
  );
}

const SUB_LABELS: { key: keyof Review; label: string }[] = [
  { key: 'punctuality', label: 'Pontualidade' },
  { key: 'quality', label: 'Qualidade' },
  { key: 'communication', label: 'Comunicação' },
  { key: 'cleanliness', label: 'Limpeza' },
];

const getClientName = (clientId: unknown): string => {
  if (typeof clientId === 'object' && clientId !== null && 'name' in clientId) {
    return (clientId as { name: string }).name;
  }
  return 'Cliente';
};

export function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (p: number) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const result = await reviewService.getMy(p, 10);
      setReviews(prev => p === 1 ? result.items : [...prev, ...result.items]);
      setTotalCount(result.pagination.total);
      setHasMore(p < result.pagination.totalPages);
    } catch {
      if (p === 1) setError('Não foi possível carregar suas avaliações.');
    } finally {
      if (p === 1) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '—';

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="orb w-72 h-72 bg-amber-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      <motion.div {...fadeUp(0)} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/20">
            <Star className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest">Reputação</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Minhas{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-300">Avaliações</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {totalCount > 0
            ? `${totalCount} avaliação${totalCount !== 1 ? 'ões' : ''} recebida${totalCount !== 1 ? 's' : ''}.`
            : 'Avaliações recebidas dos seus clientes.'}
        </p>
      </motion.div>

      {/* Stat card */}
      {!loading && !error && reviews.length > 0 && (
        <motion.div {...fadeUp(0)} className="mb-6 flex items-center gap-5 rounded-2xl border border-amber-500/15 bg-amber-500/[0.07] p-5">
          <div className="text-center">
            <p className="text-4xl font-extrabold text-amber-400 leading-none">{avg}</p>
            <p className="text-xs text-white/40 mt-1">média geral</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-4xl font-extrabold text-white leading-none">{totalCount}</p>
            <p className="text-xs text-white/40 mt-1">avaliação{totalCount !== 1 ? 'ões' : ''}</p>
          </div>
          <div className="flex-1 flex justify-end">
            <StarRow value={Number(avg)} />
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/5 p-5 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex gap-2 mb-3">
                <div className="h-4 w-24 bg-white/8 rounded-full" />
                <div className="h-4 w-16 bg-white/5 rounded-full" />
              </div>
              <div className="h-3 bg-white/5 rounded-lg w-full mb-2" />
              <div className="h-3 bg-white/5 rounded-lg w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <motion.div {...fadeUp(0)} className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </motion.div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <motion.div {...fadeUp(0)} className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/8 mb-4">
            <Star className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="font-semibold text-white/60 mb-1">Nenhuma avaliação ainda</h3>
          <p className="text-sm text-white/30 max-w-xs">Complete ordens de serviço para receber avaliações dos seus clientes.</p>
        </motion.div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <>
        <div className="space-y-3">
          {reviews.map((review, i) => (
            <motion.div key={review._id} {...fadeUp(i)}>
              <div className="rounded-2xl border border-white/8 p-5 transition-all duration-200 hover:border-white/15"
                style={{ background: 'rgba(255,255,255,0.03)' }}>

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white/80">{getClientName(review.clientId)}</p>
                    <p className="text-xs text-white/30 mt-0.5">{formatDate(review.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRow value={review.rating} />
                    <span className="text-sm font-bold text-amber-400">{review.rating}</span>
                  </div>
                </div>

                {review.comment && (
                  <div className="flex items-start gap-2 mb-3 rounded-xl bg-white/[0.03] border border-white/5 p-3">
                    <MessageSquare className="h-4 w-4 text-white/25 shrink-0 mt-0.5" />
                    <p className="text-sm text-white/60 leading-relaxed">{review.comment}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SUB_LABELS.map(({ key, label }) => {
                    const val = review[key] as number | undefined;
                    if (val == null) return null;
                    return (
                      <div key={key} className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5 text-center">
                        <p className="text-[10px] text-white/30 mb-1">{label}</p>
                        <p className="font-bold text-sm text-white/70">{val}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
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
