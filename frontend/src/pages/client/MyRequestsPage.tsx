import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Plus } from 'lucide-react';
import { serviceRequestService } from '@/services/serviceRequest.service';
import type { Category, ServiceRequest } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

const URGENCY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const URGENCY_COLORS: Record<string, string> = {
  low: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  high: 'text-red-600 bg-red-50',
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as const },
  }),
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

  const getCategoryName = (categoryId: string | Category) => {
    if (typeof categoryId === 'object') return categoryId.name;
    return '—';
  };

  return (
    <div>
      <PageHeader
        title="Minhas Solicitações"
        action={
          <Button onClick={() => navigate('/cliente/solicitacoes/nova')}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Solicitação
          </Button>
        }
      />

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && error && (
        <Card>
          <p className="text-sm text-danger">{error}</p>
        </Card>
      )}

      {!loading && !error && requests.length === 0 && (
        <EmptyState
          icon={FileText}
          title="Nenhuma solicitação ainda"
          description="Publique o serviço que você precisa e receba orçamentos de prestadores."
          action={{ label: 'Publicar meu primeiro serviço', onClick: () => navigate('/cliente/solicitacoes/nova') }}
        />
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((req, i) => (
            <motion.div key={req._id} custom={i} variants={itemVariants} initial="hidden" animate="visible">
              <Card hover>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusBadge status={req.status} />
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${URGENCY_COLORS[req.urgency] ?? ''}`}>
                        {URGENCY_LABELS[req.urgency] ?? req.urgency}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 truncate">{getCategoryName(req.categoryId)}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {req.city}{req.neighborhood ? ` — ${req.neighborhood}` : ''} · {formatDate(req.createdAt)}
                    </p>
                    <p className="text-sm text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">{req.description}</p>
                  </div>
                  <Link
                    to={`/cliente/solicitacoes/${req._id}`}
                    className="shrink-0 text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                  >
                    Ver detalhes
                    <span className="text-primary/50">→</span>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
