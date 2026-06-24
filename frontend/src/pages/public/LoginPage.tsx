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
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormData) {
    try {
      const result = await authService.login(values);
      login(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer login');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-800 rounded-xl mb-3">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-800">Entrar na MãoCerta</h1>
          <p className="text-sm text-surface-600 mt-1">Acesse sua conta para continuar</p>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-surface-600">
              Não tem uma conta?{' '}
              <Link to="/cadastro/cliente" className="text-primary-800 font-medium hover:underline">
                Cadastre-se
              </Link>
            </p>
            <p className="text-sm text-surface-600">
              É prestador?{' '}
              <Link to="/cadastro/prestador" className="text-primary-800 font-medium hover:underline">
                Acesse aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
