import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hammer, Zap, Paintbrush, Wrench, Scissors, Truck, Leaf, Monitor,
  Home, Wind, Droplets, Shield, Search, Plus,
} from 'lucide-react';
import { categoryService } from '@/services/category.service';
import type { Category } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  construcao: Hammer,
  eletrica: Zap,
  pintura: Paintbrush,
  hidraulica: Droplets,
  limpeza: Wind,
  jardinagem: Leaf,
  reformas: Wrench,
  beleza: Scissors,
  mudancas: Truck,
  ti: Monitor,
  seguranca: Shield,
  default: Home,
};

function getCategoryIcon(slug: string): React.ElementType {
  const key = Object.keys(CATEGORY_ICONS).find((k) => slug.includes(k));
  return key ? CATEGORY_ICONS[key] : CATEGORY_ICONS.default;
}

export function ExplorePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [city, setCity] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryService
      .getAll()
      .then(setCategories)
      .catch(() => setError('Não foi possível carregar as categorias.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCity(cityInput.trim());
  };

  const handleCategoryClick = (cat: Category) => {
    navigate('/cliente/solicitacoes/nova', {
      state: { categoryId: cat._id, city },
    });
  };

  return (
    <div>
      <PageHeader
        title="Explorar categorias"
        subtitle="Escolha uma categoria e publique seu pedido de serviço"
        action={
          <Button onClick={() => navigate('/cliente/solicitacoes/nova')}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Solicitação
          </Button>
        }
      />

      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-md">
        <Input
          placeholder="Filtrar por cidade (ex: São Paulo)"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {city && (
        <p className="mb-4 text-sm text-slate-500">
          Mostrando categorias para: <strong>{city}</strong>{' '}
          <button
            className="text-primary underline ml-1"
            onClick={() => { setCity(''); setCityInput(''); }}
          >
            Limpar
          </button>
        </p>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && error && (
        <EmptyState icon={Shield} title="Erro ao carregar" description={error} />
      )}

      {!loading && !error && categories.length === 0 && (
        <EmptyState
          icon={Home}
          title="Nenhuma categoria disponível"
          description="Volte em breve ou publique sua solicitação diretamente."
          action={{ label: 'Nova Solicitação', onClick: () => navigate('/cliente/solicitacoes/nova') }}
        />
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            return (
              <button
                key={cat._id}
                onClick={() => handleCategoryClick(cat)}
                className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-primary hover:shadow-md transition-all text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-slate-700">{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
