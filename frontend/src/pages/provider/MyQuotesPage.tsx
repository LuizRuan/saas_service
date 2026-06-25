import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { quoteService } from '@/services/quote.service';
import type { Quote, ServiceRequest } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatCurrency, formatDate } from '@/lib/utils';

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

  const getRequestDescription = (serviceRequestId: string | ServiceRequest) => {
    if (typeof serviceRequestId === 'object') {
      return {
        description: serviceRequestId.description,
        city: serviceRequestId.city,
      };
    }
    return { description: '—', city: '—' };
  };

  return (
    <div>
      <PageHeader title="Meus Orçamentos" />

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && error && <Alert type="error" message={error} />}

      {!loading && !error && quotes.length === 0 && (
        <EmptyState
          icon={FileText}
          title="Nenhum orçamento enviado"
          description="Você ainda não enviou orçamentos. Acesse os pedidos disponíveis e envie sua proposta."
        />
      )}

      {!loading && !error && quotes.length > 0 && (
        <div className="space-y-3">
          {quotes.map((quote) => {
            const { description, city } = getRequestDescription(quote.serviceRequestId);
            return (
              <Card key={quote._id}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{city} · {formatDate(quote.createdAt)}</p>
                  </div>
                  <StatusBadge status={quote.status} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
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
                {quote.estimatedTime && (
                  <p className="text-xs text-slate-500 mt-2">Prazo: {quote.estimatedTime}</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
