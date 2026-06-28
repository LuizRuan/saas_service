import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, AlertCircle,
  Send, CheckCircle2, DollarSign, ShieldCheck, Timer,
} from 'lucide-react';
import { serviceRequestService } from '@/services/serviceRequest.service';
import { quoteService } from '@/services/quote.service';
import type { CreateQuoteData, Quote, ServiceRequest, ServiceRequestStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { fadeUp } from '@/lib/animations';
import { URGENCY_CONFIG, getCategoryName } from '@/lib/constants';

const SR_STATUS_CONFIG: Record<ServiceRequestStatus, { label: string; cls: string }> = {
  open:             { label: 'Aberta',          cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  quoted:           { label: 'Com orçamentos',  cls: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  scheduled:        { label: 'Agendada',        cls: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  in_progress:      { label: 'Em andamento',    cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  waiting_approval: { label: 'Aguard. aprovação', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  completed:        { label: 'Concluída',       cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelada',       cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  dispute:          { label: 'Em disputa',      cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
};

export function ProviderRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [existingQuote, setExistingQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [totalAmount, setTotalAmount] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [warrantyDays, setWarrantyDays] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    Promise.all([serviceRequestService.getById(id), quoteService.getMy()])
      .then(([req, myQuotes]) => {
        if (controller.signal.aborted) return;
        setRequest(req);
        const found = myQuotes.items.find((q) => {
          const reqId = typeof q.serviceRequestId === 'object' ? q.serviceRequestId._id : q.serviceRequestId;
          return reqId === id;
        });
        if (found) setExistingQuote(found);
      })
      .catch(() => { if (!controller.signal.aborted) setError('Não foi possível carregar o pedido.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const amount = parseFloat(totalAmount);
    if (!totalAmount || isNaN(amount) || amount <= 0) { setFormError('Informe um valor total válido.'); return; }
    if (!id) return;
    setSubmitting(true);
    try {
      const data: CreateQuoteData = {
        serviceRequestId: id,
        totalAmount: amount,
        ...(description && { description }),
        ...(estimatedTime && { estimatedTime }),
        warrantyDays: parseInt(warrantyDays) || 0,
      };
      await quoteService.create(data);
      navigate('/prestador/orcamentos');
    } catch {
      setFormError('Não foi possível enviar o orçamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 mb-5 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error || 'Pedido não encontrado.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="orb w-64 h-64 bg-indigo-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      {/* Back */}
      <motion.button {...fadeUp(0)} onClick={() => navigate('/prestador/pedidos')}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 mb-6 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Voltar aos pedidos
      </motion.button>

      {/* Request card */}
      <motion.div {...fadeUp(0.05)}
        className="rounded-2xl border border-white/8 p-6 mb-5"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-bold text-xl text-white">{getCategoryName(request.categoryId)}</p>
            <div className="flex items-center gap-1.5 text-sm text-white/40 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {request.city}{request.neighborhood ? ` — ${request.neighborhood}` : ''}
            </div>
          </div>
          <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${SR_STATUS_CONFIG[request.status]?.cls ?? ''}`}>
            {SR_STATUS_CONFIG[request.status]?.label ?? request.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {request.approximateAddress && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs text-white/30 mb-1">Endereço aprox.</p>
              <p className="text-white/70 text-sm">{request.approximateAddress}</p>
            </div>
          )}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-xs text-white/30 mb-1">Urgência</p>
            <p className="text-white/70">{URGENCY_CONFIG[request.urgency]?.label ?? request.urgency}</p>
          </div>
          {request.desiredDate && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs text-white/30 mb-1">Data desejada</p>
              <p className="text-white/70">{formatDate(request.desiredDate)}</p>
            </div>
          )}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-xs text-white/30 mb-1">Criado em</p>
            <p className="text-white/70">{formatDate(request.createdAt)}</p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Descrição do cliente</p>
          <p className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">{request.description}</p>
        </div>
      </motion.div>

      {/* Quote section */}
      {existingQuote ? (
        <motion.div {...fadeUp(0.1)}
          className="rounded-2xl border border-emerald-500/20 p-6"
          style={{ background: 'rgba(16,185,129,0.05)' }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <h2 className="font-bold text-white">Seu orçamento enviado</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Total', value: formatCurrency(existingQuote.totalAmount), highlight: true },
              { label: 'Sinal (20%)', value: formatCurrency(existingQuote.depositAmount), highlight: false },
              { label: 'Restante (80%)', value: formatCurrency(existingQuote.remainingAmount), highlight: false },
            ].map(item => (
              <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                <p className="text-[10px] text-white/30 mb-1">{item.label}</p>
                <p className={`font-bold text-sm ${item.highlight ? 'text-white' : 'text-white/60'}`}>{item.value}</p>
              </div>
            ))}
          </div>
          {existingQuote.estimatedTime && <p className="text-sm text-white/40">Prazo: {existingQuote.estimatedTime}</p>}
          {existingQuote.warrantyDays > 0 && <p className="text-sm text-white/40 mt-1">Garantia: {existingQuote.warrantyDays} dias</p>}
        </motion.div>
      ) : (
        <motion.div {...fadeUp(0.1)}
          className="rounded-2xl border border-white/8 p-6"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Send className="h-5 w-5 text-blue-400" />
            <h2 className="font-bold text-white">Enviar orçamento</h2>
          </div>

          {formError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 mb-4">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Valor total */}
            <div>
              <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
                Valor total (R$) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                <input type="number" min="0" step="0.01" value={totalAmount}
                  onChange={e => setTotalAmount(e.target.value)} placeholder="Ex: 500.00"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5
                    text-sm text-white placeholder:text-white/20 outline-none
                    focus:border-blue-500/50 focus:bg-white/8 transition-all" />
              </div>
              {totalAmount && !isNaN(parseFloat(totalAmount)) && (
                <p className="text-xs text-white/30 mt-1.5 flex gap-3">
                  <span>Sinal (20%): {formatCurrency(parseFloat(totalAmount) * 0.2)}</span>
                  <span>Restante (80%): {formatCurrency(parseFloat(totalAmount) * 0.8)}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
                  Prazo estimado
                </label>
                <div className="relative">
                  <Timer className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                  <input type="text" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)}
                    placeholder="Ex: 3 dias úteis"
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5
                      text-sm text-white placeholder:text-white/20 outline-none
                      focus:border-blue-500/50 focus:bg-white/8 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
                  Garantia (dias)
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                  <input type="number" min="0" value={warrantyDays} onChange={e => setWarrantyDays(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5
                      text-sm text-white placeholder:text-white/20 outline-none
                      focus:border-blue-500/50 focus:bg-white/8 transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
                Observações (opcional)
              </label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Descreva detalhes do seu orçamento..." rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5
                  text-sm text-white placeholder:text-white/20 outline-none resize-none
                  focus:border-blue-500/50 focus:bg-white/8 transition-all" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => navigate('/prestador/pedidos')}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-white/40
                  hover:border-white/20 hover:text-white/70 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-sm font-bold text-white
                  transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? (
                  <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="h-4 w-4" /> Enviar orçamento</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
