import { Construction } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';

export default function ProviderProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <EmptyState
        title="Perfil do prestador"
        description="Será implementado na Etapa 2-B."
        icon={<Construction className="w-8 h-8" />}
      />
    </div>
  );
}
