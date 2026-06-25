import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { serviceRequestService } from '@/services/serviceRequest.service';
import { quoteService } from '@/services/quote.service';
import type { Category, CreateQuoteData, Quote, ServiceRequest } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency, formatDate } from '@/lib/utils';

const URGENCY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
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
    Promise.all([
      serviceRequestService.getById(id),
      quoteService.getMy(),
    ])
      .then(([req, myQuotes]) => {
        setRequest(req);
        const found = myQuotes.find((q) => {
          const reqId = typeof q.serviceRequestId === 'object'
            ? q.serviceRequestId._id
            : q.serviceRequestId;
          return reqId === id;
        });
        if (found) setExistingQuote(found);
      })
      .catch(() => setError('Não foi possível carregar o pedido.'))
      .finally(() => setLoading(false));
  }, [id]);

  const getCategoryName = (categoryId: string | Category) =>
    typeof categoryId === 'object' ? categoryId.name : '—';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const amount = parseFloat(totalAmount);
    if (!totalAmount || isNaN(amount) || amount <= 0) {
      setFormError('Informe um valor total válido.');
      return;
    }
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
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <Alert type="error" message={error || 'Pedido não encontrado.'} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="secondary" onClick={() => navigate('/prestador/pedidos')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <PageHeader title="Detalhes do Pedido" />
      </div>

      <Card className="mb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-semibold text-lg text-slate-800">{getCategoryName(request.categoryId)}</p>
            <p className="text-sm text-slate-500">
              {request.city}{request.neighborhood ? ` — ${request.neighborhood}` : ''}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="space-y-2 text-sm">
          {request.approximateAddress && (
            <p><span className="text-slate-500">Endereço aprox.:</span> {request.approximateAddress}</p>
          )}
          <p><span className="text-slate-500">Urgência:</span> {URGENCY_LABELS[request.urgency] ?? request.urgency}</p>
          {request.desiredDate && (
            <p><span className="text-slate-500">Data desejada:</span> {formatDate(request.desiredDate)}</p>
          )}
          <p><span className="text-slate-500">Criado em:</span> {formatDate(request.createdAt)}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Descrição do cliente</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{request.description}</p>
        </div>
      </Card>

      {existingQuote ? (
        <Card>
          <h2 className="font-semibold text-slate-800 mb-3">Seu orçamento enviado</h2>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-500">Status</p>
            <StatusBadge status={existingQuote.status} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm mb-3">
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">Total</p>
              <p className="font-bold text-slate-800">{formatCurrency(existingQuote.totalAmount)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">Sinal (20%)</p>
              <p className="font-semibold text-slate-700">{formatCurrency(existingQuote.depositAmount)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">Restante (80%)</p>
              <p className="font-semibold text-slate-700">{formatCurrency(existingQuote.remainingAmount)}</p>
            </div>
          </div>
          {existingQuote.estimatedTime && (
            <p className="text-sm text-slate-600">Prazo: {existingQuote.estimatedTime}</p>
          )}
          {existingQuote.warrantyDays > 0 && (
            <p className="text-sm text-slate-600">Garantia: {existingQuote.warrantyDays} dias</p>
          )}
          {existingQuote.description && (
            <p className="text-sm text-slate-600 mt-2">{existingQuote.description}</p>
          )}
        </Card>
      ) : (
        <Card>
          <h2 className="font-semibold text-slate-800 mb-4">Enviar orçamento</h2>
          {formError && <Alert type="error" message={formError} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Valor total (R$) *"
              type="number"
              min="0"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Ex: 500.00"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Prazo estimado"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="Ex: 3 dias úteis"
              />
              <Input
                label="Garantia (dias)"
                type="number"
                min="0"
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(e.target.value)}
              />
            </div>

            <Textarea
              label="Observações (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhes do seu orçamento..."
              rows={4}
            />

            <p className="text-xs text-slate-400">
              O sinal (20%) e restante (80%) são calculados automaticamente pelo sistema.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/prestador/pedidos')}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={submitting}>
                Enviar orçamento
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
