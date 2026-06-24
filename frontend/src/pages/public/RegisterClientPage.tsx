import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2, 'Use a sigla do estado (ex: SP)').optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterClientPage() {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormData) {
    try {
      const result = await authService.registerClient(values);
      toast.success('Conta criada com sucesso!');
      login(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar conta');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-800 rounded-xl mb-3">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-800">Criar conta de cliente</h1>
          <p className="text-sm text-surface-600 mt-1">Encontre prestadores de confiança perto de você</p>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              placeholder="João Silva"
              required
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              required
              error={errors.password?.message}
              hint="Mínimo 8 caracteres"
              {...register('password')}
            />
            <Input
              label="Telefone"
              type="tel"
              placeholder="(11) 99999-9999"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cidade"
                placeholder="São Paulo"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="Estado"
                placeholder="SP"
                maxLength={2}
                error={errors.state?.message}
                {...register('state')}
              />
            </div>

            <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
              Criar conta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-600">
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
