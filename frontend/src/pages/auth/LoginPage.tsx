import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Wrench, Mail, Lock, User, HardHat, Shield } from 'lucide-react';

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirecionar se já está logado
  if (user) {
    const path = user.role === 'client' ? '/cliente' : user.role === 'provider' ? '/prestador' : '/admin';
    navigate(path, { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // AuthContext atualizará user; o navigate acontece via efeito acima
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'E-mail ou senha inválidos.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 pointer-events-none" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-60 h-60 bg-success/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-8 sm:p-10 shadow-premium">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-light shadow-md">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Entrar na MãoCerta</h1>
            <p className="mt-1.5 text-sm text-slate-500">Acesse sua conta para continuar</p>
          </div>

          {error && <Alert type="error" message={error} className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              icon={<Lock className="h-4 w-4" />}
            />
            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Não tem conta?{' '}
            <Link to="/cadastro" className="font-semibold text-primary hover:text-primary-dark transition-colors">
              Cadastre-se gratuitamente
            </Link>
          </div>
        </div>

        {/* Demo users */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-5 rounded-2xl bg-white border border-slate-100 p-5 shadow-card"
        >
          <p className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Contas demo para teste
          </p>
          <div className="space-y-2">
            {[
              { role: 'Admin', email: 'admin@maocerta.com', icon: Shield, color: 'text-red-500' },
              { role: 'Cliente', email: 'cliente@maocerta.com', icon: User, color: 'text-blue-500' },
              { role: 'Prestador', email: 'prestador@maocerta.com', icon: HardHat, color: 'text-emerald-500' },
            ].map((demo) => (
              <button
                key={demo.email}
                onClick={() => fillDemo(demo.email)}
                className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <demo.icon className={`h-4 w-4 ${demo.color}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-slate-700">{demo.role}</span>
                  <span className="text-xs text-slate-400 ml-2">{demo.email}</span>
                </div>
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Usar →
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
