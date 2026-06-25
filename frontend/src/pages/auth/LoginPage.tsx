import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Wrench, Mail, Lock, User, HardHat, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const DEMO_USERS = [
    { role: 'Admin',     email: 'admin@maocerta.com',    icon: Shield,   color: 'from-red-500 to-rose-600',    glow: 'rgba(239,68,68,0.3)'    },
    { role: 'Cliente',   email: 'cliente@maocerta.com',  icon: User,     color: 'from-blue-500 to-blue-600',   glow: 'rgba(59,130,246,0.3)'   },
    { role: 'Prestador', email: 'prestador@maocerta.com',icon: HardHat,  color: 'from-emerald-500 to-teal-600',glow: 'rgba(16,185,129,0.3)'   },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050912 0%, #0a0f1e 50%, #080e1c 100%)' }}
    >
      {/* Orbs */}
      <div className="orb w-96 h-96 bg-emerald-500 top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]" />
      <div className="orb w-80 h-80 bg-blue-600 bottom-0 right-0 translate-x-1/3 translate-y-1/3 opacity-[0.07]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Main Card */}
        <div className="rounded-3xl border border-white/10 p-8 sm:p-10 mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)' }}>

          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 relative flex h-14 w-14 items-center justify-center rounded-2xl
              bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl"
              style={{ boxShadow: '0 0 30px -5px rgba(16,185,129,0.5)' }}>
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Entrar na MãoCerta</h1>
            <p className="mt-1.5 text-sm text-white/40">Acesse sua conta para continuar</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
            >
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3
                    text-sm text-white placeholder:text-white/20 outline-none
                    focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-11 py-3
                    text-sm text-white placeholder:text-white/20 outline-none
                    focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold
                text-white shadow-lg transition-all duration-200 hover:from-emerald-500 hover:to-teal-500
                hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-2
                active:scale-[0.98]"
              style={{ boxShadow: loading ? 'none' : '0 0 20px -5px rgba(16,185,129,0.4)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/30">
            Não tem conta?{' '}
            <Link to="/cadastro" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>

        {/* Demo users */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="rounded-2xl border border-white/8 p-5"
          style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)' }}
        >
          <p className="text-[11px] font-semibold text-white/30 mb-3 uppercase tracking-widest flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            Contas demo para teste
          </p>
          <div className="space-y-1.5">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.email}
                onClick={() => fillDemo(demo.email)}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl
                  border border-transparent hover:border-white/8 hover:bg-white/5 transition-all group"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${demo.color} shadow-md shrink-0`}
                  style={{ boxShadow: `0 4px 12px -2px ${demo.glow}` }}>
                  <demo.icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-white/60">{demo.role}</span>
                  <span className="text-xs text-white/30 ml-2">{demo.email}</span>
                </div>
                <span className="text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
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
