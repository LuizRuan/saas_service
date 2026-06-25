import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryService } from '@/services/category.service';
import { serviceRequestService } from '@/services/serviceRequest.service';
import type { Category, CreateServiceRequestData, Urgency } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { FileEdit } from 'lucide-react';

interface LocationState {
  categoryId?: string;
  city?: string;
}

export function NewRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as LocationState) ?? {};

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [categoryId, setCategoryId] = useState(prefill.categoryId ?? '');
  const [city, setCity] = useState(prefill.city ?? '');
  const [neighborhood, setNeighborhood] = useState('');
  const [approximateAddress, setApproximateAddress] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('medium');
  const [desiredDate, setDesiredDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryService
      .getAll()
      .then(setCategories)
      .catch(() => setError('Não foi possível carregar as categorias.'))
      .finally(() => setLoadingCats(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!categoryId || !city || !description) {
      setError('Preencha os campos obrigatórios: categoria, cidade e descrição.');
      return;
    }
    setSubmitting(true);
    try {
      const data: CreateServiceRequestData = {
        categoryId,
        city,
        description,
        urgency,
        ...(neighborhood && { neighborhood }),
        ...(approximateAddress && { approximateAddress }),
        ...(fullAddress && { fullAddress }),
        ...(desiredDate && { desiredDate }),
      };
      await serviceRequestService.create(data);
      navigate('/cliente/solicitacoes');
    } catch {
      setError('Não foi possível criar a solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCats) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl"
    >
      <PageHeader
        title="Publicar serviço que preciso"
        subtitle="Descreva o que precisa, receba orçamentos e escolha o melhor prestador."
      />

      {error && <Alert type="error" message={error} className="mb-4" />}

      <Card className="relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-success" />

        <div className="flex items-center gap-3 mb-6 pt-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <FileEdit className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Detalhes do serviço</p>
            <p className="text-xs text-slate-500">Preencha as informações abaixo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Categoria *"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            placeholder="Selecione uma categoria"
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
          />

          <Input
            label="Cidade *"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex: São Paulo"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Bairro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Opcional"
            />
            <Input
              label="Endereço aproximado"
              value={approximateAddress}
              onChange={(e) => setApproximateAddress(e.target.value)}
              placeholder="Ex: Rua das Flores, 100"
            />
          </div>

          <Input
            label="Endereço completo (privado)"
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            placeholder="Visível apenas para o prestador selecionado"
          />

          <Textarea
            label="Descrição do serviço *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva detalhadamente o que você precisa..."
            rows={5}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Urgência *"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Urgency)}
              options={[
                { value: 'low', label: 'Baixa' },
                { value: 'medium', label: 'Média' },
                { value: 'high', label: 'Alta' },
              ]}
            />
            <Input
              label="Data desejada"
              type="date"
              value={desiredDate}
              onChange={(e) => setDesiredDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/cliente/solicitacoes')}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              Publicar solicitação
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
