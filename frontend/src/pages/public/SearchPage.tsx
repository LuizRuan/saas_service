import { Construction } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-surface-800 mb-6">Buscar prestadores</h1>
      <EmptyState
        title="Em breve"
        description="A busca de prestadores será implementada na Etapa 2-B após as rotas de providers estarem disponíveis."
        icon={<Construction className="w-8 h-8" />}
      />
    </div>
  );
}
