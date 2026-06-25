import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, Clock, AlertCircle,
  FileText, CheckCircle2, XCircle, Timer, ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import { serviceRequestService } from '@/services/serviceRequest.service';
import { quoteService } from '@/services/quote.service';
import type { Category, Order, Quote, ServiceRequest } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const URGENCY: Record<string, { label: string; cls: string }> = {
  low:    { label: 'Baixa',  cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: 'Média',  cls: 'text-amber-400   bg-amber-500/10   border-amber-500/20'  },
  high:   { label: 'Alta',   cls: 'text-red-400     bg-red-500/10     border-red-500/20'    },
};

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const },
});

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState('');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([serviceRequestService.getById(id), quoteService.getByRequest(id)])
      .then(([req, qs]) => { setRequest(req); setQuotes(qs); })
      .catch(() => setError('Não foi possível carregar os dados.'))
      .finally(() => setLoading(false));
  }, [id]);

  const getCategoryName = (categoryId: string | Category) =>
    typeof categoryId === 'object' ? categoryId.name : categoryId;

  const getProviderName = (providerId: Quote['providerId']) => {
    if (typeof providerId === 'object' && 'name' in providerId) return providerId.name;
    return 'Prestador';
  };

  const handleCancel = async () => {
    if (!id) return;
    setActionError('');
    setCancelling(true);
    try {
      const updated = await serviceRequestService.cancel(id);
      setRequest(updated);
    } catch {
      setActionError('Não foi possível cancelar a solicitação.');
    } finally {
      setCancelling(false);
    }
  };

  const handleAccept = async (quoteId: string) => {
    setActionError('');
    setAcceptingId(quoteId);
    try {
      const order = await quoteService.accept(quoteId);
      setSuccessOrder(order);
      // Atualiza status local da solicitação e dos orçamentos
      setRequest(prev => prev ? { ...prev, status: 'scheduled' } : prev);
      setQuotes(prev => prev.map(q =>
        q._id === quoteId
          ? { ...q, status: 'accepted' }
          : q.status === 'sent'
            ? { ...q, status: 'rejected' }
            : q
      ));
    } catch {
      setActionError('Não foi possível aceitar o orçamento.');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (quoteId: string) => {
    setActionError('');
    setRejectingId(quoteId);
    try {
      const updated = await quoteService.reject(quoteId);
      setQuotes(prev => prev.map(q => (q._id === quoteId ? updated : q)));
    } catch {
      setActionError('Não foi possível recusar o orçamento.');
    } finally {
      setRejectingId(null);
    }
  };

  const canCancel = request && (request.status === 'open' || request.status === 'quoted');

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="rounded-2xl border border-white/5 p-6 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="h-4 bg-white/8 rounded-lg w-1/3 mb-3" />
            <div className="h-3 bg-white/5 rounded-lg w-2/3 mb-2" />
            <div className="h-3 bg-white/5 rounded-lg w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 mb-5 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error || 'Solicitação não encontrada.'}</p>
        </div>
      </div>
    );
  }

  const urgencyCfg = URGENCY[request.urgency] ?? URGENCY.medium;

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="orb w-64 h-64 bg-blue-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      <motion.button {...fadeUp(0)} onClick={() => navigate('/cliente/solicitacoes')}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 mb-6 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Voltar às solicitações
      </motion.button>

      {actionError && (
        <motion.div {...fadeUp(0)} className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 mb-4">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{actionError}</p>
        </motion.div>
      )}

      {/* Request card */}
      <motion.div {...fadeUp(0.05)} className="rounded-2xl border border-white/8 p-6 mb-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-bold text-xl text-white">{getCategoryName(request.categoryId)}</p>
            <div className="flex items-center gap-1.5 text-sm text-white/40 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {request.city}{request.neighborhood ? ` — ${request.neighborhood}` : ''}
            </div>
          </div>
          <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${urgencyCfg.cls}`}>
            <Clock className="h-3 w-3" /> {urgencyCfg.label} urgência
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {request.approximateAddress && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">Endereço aprox.</p>
              <p className="text-sm text-white/65">{request.approximateAddress}</p>
            </div>
          )}
          {request.desiredDate && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">Data desejada</p>
              <p className="text-sm text-white/65 flex items-center gap-1.5"><Calendar className="h-3 w-3" />{formatDate(request.desiredDate)}</p>
            </div>
          )}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">Criada em</p>
            <p className="text-sm text-white/65">{formatDate(request.createdAt)}</p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <p className="text-[10px] text-white/30 mb-2 uppercase tracking-wider">Descrição</p>
          <p className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">{request.description}</p>
        </div>

        {canCancel && (
          <div className="border-t border-white/5 pt-4 mt-4">
            <button onClick={handleCancel} disabled={cancelling}
              className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300
                border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 px-4 py-2 rounded-xl transition-all disabled:opacity-50">
              {cancelling ? <span className="h-4 w-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <XCircle className="h-4 w-4" />}
              Cancelar solicitação
            </button>
          </div>
        )}
      </motion.div>

      {/* Quotes */}
      <motion.div {...fadeUp(0.12)}>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-white/40" />
          <h2 className="font-semibold text-white/70">Orçamentos recebidos ({quotes.length})</h2>
        </div>

        {quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-white/5"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <FileText className="h-8 w-8 text-white/15 mb-3" />
            <p className="text-sm font-medium text-white/40">Nenhum orçamento ainda</p>
            <p className="text-xs text-white/25 mt-1">Aguarde enquanto prestadores enviam suas propostas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote, i) => {
              const isAccepting = acceptingId === quote._id;
              const isRejecting = rejectingId === quote._id;
              const canAct = quote.status === 'sent' && request.status !== 'cancelled' && request.status !== 'completed';
              return (
                <motion.div key={quote._id} {...fadeUp(0.14 + i * 0.05)}
                  className="rounded-2xl border border-white/8 p-5"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-semibold text-white">{getProviderName(quote.providerId)}</p>
                      <div className="flex gap-3 mt-1">
                        {quote.estimatedTime && (
                          <span className="flex items-center gap-1 text-xs text-white/35"><Timer className="h-3 w-3" />{quote.estimatedTime}</span>
                        )}
                        {quote.warrantyDays > 0 && (
                          <span className="flex items-center gap-1 text-xs text-white/35"><ShieldCheck className="h-3 w-3" />{quote.warrantyDays}d garantia</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                      quote.status === 'accepted' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                      quote.status === 'rejected' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                      'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    }`}>
                      {quote.status === 'accepted' ? 'Aceito' : quote.status === 'rejected' ? 'Recusado' : 'Enviado'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Total', value: formatCurrency(quote.totalAmount), highlight: true },
                      { label: 'Sinal (20%)', value: formatCurrency(quote.depositAmount), highlight: false },
                      { label: 'Restante', value: formatCurrency(quote.remainingAmount), highlight: false },
                    ].map(item => (
                      <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                        <p className="text-[10px] text-white/30 mb-1">{item.label}</p>
                        <p className={`font-bold text-sm ${item.highlight ? 'text-white' : 'text-white/55'}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {quote.description && (
                    <p className="text-sm text-white/45 mb-4 leading-relaxed">{quote.description}</p>
                  )}

                  {canAct && (
                    <div className="flex gap-3">
                      <button onClick={() => handleAccept(quote._id)} disabled={!!acceptingId}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500
                          py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50">
                        {isAccepting ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Aceitar orçamento
                      </button>
                      <button onClick={() => handleReject(quote._id)} disabled={!!rejectingId}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10
                          hover:bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all disabled:opacity-50">
                        {isRejecting ? <span className="h-4 w-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <XCircle className="h-4 w-4" />}
                        Recusar
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Success modal */}
      <AnimatePresence>
        {successOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-emerald-500/20 p-8 text-center"
              style={{ background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)' }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/20 mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Orçamento aceito!</h3>
              <p className="text-sm text-white/50 mb-6">Uma ordem de serviço foi criada. O prestador será notificado.</p>
              <div className="flex gap-3">
                <button onClick={() => navigate('/cliente/ordens')}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-sm font-bold text-white transition-all">
                  <ClipboardList className="h-4 w-4" /> Ver minhas ordens
                </button>
                <button onClick={() => setSuccessOrder(null)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/40 hover:text-white/70 transition-all">
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
