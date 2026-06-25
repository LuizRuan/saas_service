import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MapPin, Calendar, AlertCircle, CheckCircle2, Clock, XCircle, DollarSign } from 'lucide-react';
import { quoteService } from '@/services/quote.service';
import type { Quote, ServiceRequest } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as const },
});

const STATUS: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  sent:     { label: 'Enviado',   icon: Clock,         cls: 'text-blue-400   bg-blue-500/10   border-blue-500/20'   },
  accepted: { label: 'Aceito',    icon: CheckCircle2,  cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  rejected: { label: 'Rejeitado', icon: XCircle,       cls: 'text-red-400    bg-red-500/10    border-red-500/20'    },
  expired:  { label: 'Expirado',  icon: AlertCircle,   cls: 'text-white/30   bg-white/5       border-white/10'      },
};

export function MyQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    quoteService
      .getMy()
      .then(setQuotes)
      .catch(() => setError('Não foi possível carregar seus orçamentos.'))
      .finally(() => setLoading(false));
  }, []);

  const getRequest = (serviceRequestId: string | ServiceRequest) =>
    typeof serviceRequestId === 'object'
      ? { description: serviceRequestId.description, city: serviceRequestId.city }
      : { description: '—', city: '—' };

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="orb w-72 h-72 bg-violet-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      <motion.div {...fadeUp(0)} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/15 border border-violet-500/20">
            <FileText className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <span className="text-xs font-semibold text-violet-400/80 uppercase tracking-widest">Propostas</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Meus{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-300">Orçamentos</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {quotes.length > 0 ? `${quotes.length} orçamento${quotes.length !== 1 ? 's' : ''} enviado${quotes.length !== 1 ? 's' : ''}.` : 'Acompanhe as propostas enviadas.'}
        </p>
      </motion.div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/5 p-5 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="h-5 w-20 bg-white/8 rounded-full mb-3" />
              <div className="h-4 bg-white/8 rounded-lg w-2/3 mb-2" />
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[1,2,3].map(j => <div key={j} className="h-14 bg-white/5 rounded-xl" />)}
              </div>
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

      {!loading && !error && quotes.length === 0 && (
        <motion.div {...fadeUp(0)} className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/8 mb-4">
            <FileText className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="font-semibold text-white/60 mb-1">Nenhum orçamento enviado</h3>
          <p className="text-sm text-white/30 max-w-xs">Acesse os pedidos disponíveis e envie sua proposta para conquistar clientes.</p>
        </motion.div>
      )}

      {!loading && !error && quotes.length > 0 && (
        <div className="space-y-3">
          {quotes.map((quote, i) => {
            const { description, city } = getRequest(quote.serviceRequestId);
            const cfg = STATUS[quote.status] ?? STATUS.sent;
            const StatusIcon = cfg.icon;
            return (
              <motion.div key={quote._id} {...fadeUp(i)}>
                <div className="rounded-2xl border border-white/8 p-5 transition-all duration-200 hover:border-white/15"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>

                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/70 line-clamp-2 mb-1">{description}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-white/30">
                          <MapPin className="h-3 w-3" />{city}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white/30">
                          <Calendar className="h-3 w-3" />{formatDate(quote.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${cfg.cls}`}>
                      <StatusIcon className="h-3 w-3" />{cfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total', value: formatCurrency(quote.totalAmount), highlight: true },
                      { label: 'Sinal (20%)', value: formatCurrency(quote.depositAmount), highlight: false },
                      { label: 'Restante (80%)', value: formatCurrency(quote.remainingAmount), highlight: false },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                        <p className="text-[10px] text-white/30 mb-1">{item.label}</p>
                        <p className={`font-bold text-sm ${item.highlight ? 'text-white' : 'text-white/60'}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {quote.estimatedTime && (
                    <p className="text-xs text-white/30 mt-3 flex items-center gap-1.5">
                      <DollarSign className="h-3 w-3" />Prazo estimado: {quote.estimatedTime}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
