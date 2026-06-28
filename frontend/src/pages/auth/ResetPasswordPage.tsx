import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import type { ApiResponse } from '@/types';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!token) {
      setError('Link inválido. Solicite um novo e-mail de redefinição.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post<ApiResponse<null>>('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Token inválido ou expirado. Solicite um novo link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050912 0%, #0a0f1e 50%, #080e1c 100%)' }}
    >
      <div className="orb w-96 h-96 bg-emerald-500 top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]" />
      <div className="orb w-80 h-80 bg-blue-600 bottom-0 right-0 translate-x-1/3 translate-y-1/3 opacity-[0.07]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl mb-4"
            style={{ boxShadow: '0 0 30px -5px rgba(16,185,129,0.5)' }}
          >
            <Wrench className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Nova senha</h1>
          <p className="text-sm text-white/40 mt-1">
            {done ? 'Senha redefinida com sucesso' : 'Escolha uma senha segura'}
          </p>
        </div>

        <div
          className="rounded-2xl border border-white/8 p-8"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}
        >
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-4 py-4"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Senha alterada!</p>
                <p className="text-sm text-white/40">Redirecionando para o login...</p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!token && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-300">Link inválido. <Link to="/esqueci-senha" className="underline">Solicite um novo.</Link></p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
                  Nova senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-10 py-3
                      text-sm text-white placeholder:text-white/20 outline-none
                      focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                    aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3
                      text-sm text-white placeholder:text-white/20 outline-none
                      focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold
                  text-white shadow-lg transition-all hover:from-emerald-500 hover:to-teal-500
                  disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-[0.98]"
                style={{ boxShadow: loading ? 'none' : '0 0 20px -5px rgba(16,185,129,0.4)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Redefinindo...
                  </span>
                ) : 'Redefinir senha'}
              </button>
            </form>
          )}

          <div className="mt-6 flex justify-center">
            <Link to="/login" className="text-sm text-white/30 hover:text-white/60 transition-colors">
              Voltar ao login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
