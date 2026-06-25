import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export function MyOrdersPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Minhas Ordens" />
      <EmptyState
        icon={ClipboardList}
        title="Gestão de ordens em breve"
        description="Aqui você acompanhará suas ordens de serviço. Esta funcionalidade estará disponível na próxima etapa."
        action={{ label: 'Voltar às solicitações', onClick: () => navigate('/cliente/solicitacoes') }}
      />
    </div>
  );
}
