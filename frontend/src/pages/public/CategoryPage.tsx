import { useParams } from 'react-router-dom';
import { Construction } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-surface-800 mb-6 capitalize">{slug}</h1>
      <EmptyState
        title="Em breve"
        description="A listagem por categoria será implementada na Etapa 2-B."
        icon={<Construction className="w-8 h-8" />}
      />
    </div>
  );
}
