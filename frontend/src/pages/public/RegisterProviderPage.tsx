import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Wrench, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  phone: z.string().optional(),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Use a sigla do estado (ex: SP)'),
  professionalName: z.string().min(3, 'Nome profissional é obrigatório'),
  bio: z.string().optional(),
  document: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterProviderPage() {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormData) {
    try {
      const result = await authService.registerProvider({
        ...values,
        cities: [values.city],
      });
      toast.success('Cadastro enviado! Aguarde a aprovação do administrador.');
      login(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar conta');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-800 rounded-xl mb-3">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-800">Seja um prestador</h1>
          <p className="text-sm text-surface-600 mt-1">Receba pedidos de clientes na sua cidade</p>
        </div>

        <Alert variant="info" className="mb-6">
          Após o cadastro, nossa equipe irá analisar e aprovar seu perfil em até 24 horas.
        </Alert>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-surface-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-primary-800 text-white rounded-full text-xs flex items-center justify-center">1</span>
                Dados pessoais
              </h3>
              <div className="space-y-3">
                <Input label="Nome completo" placeholder="João Silva" required error={errors.name?.message} {...register('name')} />
                <Input label="E-mail" type="email" placeholder="seu@email.com" required error={errors.email?.message} {...register('email')} />
                <Input label="Senha" type="password" placeholder="Mínimo 8 caracteres" required error={errors.password?.message} hint="Mínimo 8 caracteres" {...register('password')} />
                <Input label="Telefone / WhatsApp" type="tel" placeholder="(11) 99999-9999" error={errors.phone?.message} {...register('phone')} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Cidade" placeholder="São Paulo" required error={errors.city?.message} {...register('city')} />
                  <Input label="Estado" placeholder="SP" maxLength={2} required error={errors.state?.message} {...register('state')} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-surface-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-primary-800 text-white rounded-full text-xs flex items-center justify-center">2</span>
                Dados profissionais
              </h3>
              <div className="space-y-3">
                <Input label="Nome profissional" placeholder="ex: João Silva — Eletricista" required error={errors.professionalName?.message} {...register('professionalName')} />
                <Textarea label="Sobre você" placeholder="Descreva sua experiência, especialidades e diferenciais..." rows={3} error={errors.bio?.message} {...register('bio')} />
                <Input label="CPF ou CNPJ" placeholder="Opcional" error={errors.document?.message} {...register('document')} />
              </div>
            </div>

            <Button type="submit" fullWidth loading={isSubmitting} size="lg">
              Enviar cadastro
            </Button>
          </form>

          <div className="mt-4 space-y-1.5">
            {['Gratuito para começar', 'Aprovação em até 24h', 'Receba pedidos imediatamente'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-surface-600">
                <CheckCircle className="w-3.5 h-3.5 text-trust-600" />
                {item}
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-sm text-surface-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary-800 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
