import { useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { reviewService } from '@/services/review.service';
import { fadeUp } from '@/lib/animations';

function StarPicker({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div>
      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
            aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
          >
            <Star
              className={`h-7 w-7 transition-colors ${n <= (hovered || value) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

const SUB_RATINGS = [
  { key: 'punctuality' as const, label: 'Pontualidade' },
  { key: 'quality' as const, label: 'Qualidade do serviço' },
  { key: 'communication' as const, label: 'Comunicação' },
  { key: 'cleanliness' as const, label: 'Limpeza e organização' },
];

export function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [subRatings, setSubRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || rating === 0) return;
    setLoading(true);
    setError('');
    try {
      await reviewService.create({
        orderId: id,
        rating,
        comment: comment.trim() || undefined,
        ...Object.fromEntries(
          Object.entries(subRatings).filter(([, v]) => v > 0)
        ),
      });
      setDone(true);
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? '';
      if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('already')) {
        setError('Você já avaliou esta ordem.');
      } else {
        setError('Não foi possível enviar a avaliação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-lg mx-auto space-y-6">
      <div className="orb w-64 h-64 bg-amber-500 -top-20 -right-20 opacity-8 pointer-events-none" />

      <motion.div {...fadeUp(0)}>
        <Link to={`/cliente/ordens/${id}`}
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar à ordem
        </Link>
      </motion.div>

      <motion.div {...fadeUp(0.05)}>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
            <Star className="h-5 w-5 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Avaliar prestador</h1>
        </div>
        <p className="text-sm text-white/35 ml-[52px]">Sua avaliação ajuda outros clientes a encontrar bons profissionais.</p>
      </motion.div>

      {done ? (
        <motion.div {...fadeUp(0)}
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-8 flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-bold text-lg mb-1">Avaliação enviada!</p>
            <p className="text-sm text-white/40">Obrigado pelo seu feedback. Ele será exibido no perfil do prestador.</p>
          </div>
          <button
            onClick={() => navigate(`/cliente/ordens/${id}`)}
            className="mt-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 text-sm font-semibold px-5 py-2.5 transition-all"
          >
            Voltar à ordem
          </button>
        </motion.div>
      ) : (
        <motion.div {...fadeUp(0.1)}
          className="rounded-2xl border border-white/8 p-6 space-y-6"
          style={{ background: 'rgba(255,255,255,0.03)' }}>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <StarPicker value={rating} onChange={setRating} label="Nota geral *" />

            <div className="grid grid-cols-2 gap-4">
              {SUB_RATINGS.map(({ key, label }) => (
                <StarPicker
                  key={key}
                  value={subRatings[key] ?? 0}
                  onChange={v => setSubRatings(prev => ({ ...prev, [key]: v }))}
                  label={label}
                />
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                Comentário (opcional)
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Conte como foi a experiência com o prestador..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white
                  placeholder:text-white/20 outline-none focus:border-amber-500/50 focus:bg-white/8
                  transition-all resize-none"
              />
              <p className="text-xs text-white/25 mt-1 text-right">{comment.length}/1000</p>
            </div>

            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-3 text-sm font-bold
                text-white shadow-lg transition-all hover:from-amber-500 hover:to-orange-500
                disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </span>
              ) : 'Enviar avaliação'}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
