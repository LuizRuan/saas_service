import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { serviceRequestService } from '@/services/serviceRequest.service';
import type { Category, ServiceRequest } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/utils';

const URGENCY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const URGENCY_COLORS: Record<string, string> = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600',
};

export function AvailableRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    serviceRequestService
      .getAvailable()
      .then(setRequests)
      .catch(() => setError('Não foi possível carregar os pedidos.'))
      .finally(() => setLoading(false));
  }, []);

  const getCategoryName = (categoryId: string | Category) =>
    typeof categoryId === 'object' ? categoryId.name : '—';

  return (
    <div>
      <PageHeader
        title="Pedidos disponíveis"
        subtitle="Serviços solicitados por clientes na sua região"
      />

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && error && <Alert type="error" message={error} />}

      {!loading && !error && requests.length === 0 && (
        <EmptyState
          icon={Search}
          title="Nenhum pedido disponível"
          description="Não há pedidos disponíveis na sua região no momento. Verifique novamente mais tarde."
        />
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req._id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <StatusBadge status={req.status} />
                    <span className={`text-xs font-medium ${URGENCY_COLORS[req.urgency] ?? ''}`}>
                      {URGENCY_LABELS[req.urgency] ?? req.urgency} urgência
                    </span>
                  </div>
                  <p className="font-medium text-slate-800">{getCategoryName(req.categoryId)}</p>
                  <p className="text-sm text-slate-500">
                    {req.city}{req.neighborhood ? ` — ${req.neighborhood}` : ''}
                    {req.approximateAddress ? ` · ${req.approximateAddress}` : ''}
                  </p>
                  {req.desiredDate && (
                    <p className="text-xs text-slate-400">Data desejada: {formatDate(req.desiredDate)}</p>
                  )}
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{req.description}</p>
                </div>
                <Link
                  to={`/prestador/pedidos/${req._id}`}
                  className="shrink-0 text-sm font-medium text-primary hover:underline"
                >
                  Ver pedido →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
