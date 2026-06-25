import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { serviceRequestService } from '@/services/serviceRequest.service';
import { quoteService } from '@/services/quote.service';
import type { Category, Order, Quote, ServiceRequest } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatCurrency, formatDate } from '@/lib/utils';

const URGENCY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

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
    Promise.all([
      serviceRequestService.getById(id),
      quoteService.getByRequest(id),
    ])
      .then(([req, qs]) => {
        setRequest(req);
        setQuotes(qs);
      })
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
      setQuotes((prev) => prev.map((q) => (q._id === quoteId ? updated : q)));
    } catch {
      setActionError('Não foi possível recusar o orçamento.');
    } finally {
      setRejectingId(null);
    }
  };

  const canCancel = request && (request.status === 'open' || request.status === 'quoted');

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
        <Alert type="error" message={error || 'Solicitação não encontrada.'} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="secondary" onClick={() => navigate('/cliente/solicitacoes')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <PageHeader title="Detalhes da Solicitação" />
      </div>

      {actionError && <Alert type="error" message={actionError} className="mb-4" />}

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
          {request.fullAddress && (
            <p><span className="text-slate-500">Endereço completo:</span> {request.fullAddress}</p>
          )}
          <p><span className="text-slate-500">Urgência:</span> {URGENCY_LABELS[request.urgency] ?? request.urgency}</p>
          {request.desiredDate && (
            <p><span className="text-slate-500">Data desejada:</span> {formatDate(request.desiredDate)}</p>
          )}
          <p><span className="text-slate-500">Criada em:</span> {formatDate(request.createdAt)}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Descrição</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{request.description}</p>
        </div>

        {canCancel && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={handleCancel}
              loading={cancelling}
              className="text-danger border-danger hover:bg-danger/5"
            >
              Cancelar solicitação
            </Button>
          </div>
        )}
      </Card>

      <div>
        <h2 className="font-semibold text-slate-800 mb-3">
          Orçamentos recebidos ({quotes.length})
        </h2>

        {quotes.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Nenhum orçamento ainda"
            description="Aguarde enquanto prestadores enviam seus orçamentos para você."
          />
        )}

        <div className="space-y-3">
          {quotes.map((quote) => {
            const isAccepting = acceptingId === quote._id;
            const isRejecting = rejectingId === quote._id;
            const canAct =
              quote.status === 'sent' &&
              request.status !== 'cancelled' &&
              request.status !== 'completed';

            return (
              <Card key={quote._id}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-medium text-slate-800">{getProviderName(quote.providerId)}</p>
                    {quote.estimatedTime && (
                      <p className="text-xs text-slate-500">Prazo: {quote.estimatedTime}</p>
                    )}
                    {quote.warrantyDays > 0 && (
                      <p className="text-xs text-slate-500">Garantia: {quote.warrantyDays} dias</p>
                    )}
                  </div>
                  <StatusBadge status={quote.status} />
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div className="rounded-lg bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="font-bold text-slate-800">{formatCurrency(quote.totalAmount)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-500">Sinal (20%)</p>
                    <p className="font-semibold text-slate-700">{formatCurrency(quote.depositAmount)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-500">Restante (80%)</p>
                    <p className="font-semibold text-slate-700">{formatCurrency(quote.remainingAmount)}</p>
                  </div>
                </div>

                {quote.description && (
                  <p className="text-sm text-slate-600 mb-3">{quote.description}</p>
                )}

                {canAct && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleAccept(quote._id)} loading={isAccepting} className="flex-1">
                      Aceitar orçamento
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleReject(quote._id)}
                      loading={isRejecting}
                      className="text-danger border-danger hover:bg-danger/5"
                    >
                      Recusar
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Success modal after accepting quote */}
      <Modal
        isOpen={!!successOrder}
        onClose={() => setSuccessOrder(null)}
        title="Orçamento aceito!"
      >
        <p className="text-sm text-slate-600 mb-4">
          Seu orçamento foi aceito com sucesso. Uma ordem de serviço foi criada automaticamente.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/cliente/ordens')} className="flex-1">
            Ver minhas ordens
          </Button>
          <Button variant="secondary" onClick={() => setSuccessOrder(null)}>
            Fechar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
