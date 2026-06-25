import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/axios';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setSent(true);
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
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl mb-4"
            style={{ boxShadow: '0 0 30px -5px rgba(16,185,129,0.5)' }}>
            <Wrench className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Redefinir senha</h1>
          <p className="text-sm text-white/40 mt-1">
            {sent ? 'Verifique seu e-mail' : 'Informe seu e-mail cadastrado'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 p-8"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-4 py-4"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">E-mail enviado!</p>
                <p className="text-sm text-white/40 leading-relaxed">
                  Se existe uma conta com o e-mail <span className="text-white/60 font-medium">{email}</span>,
                  você receberá as instruções para redefinir sua senha em breve.
                </p>
              </div>
              <p className="text-xs text-white/25 mt-2">
                Não recebeu? Verifique a pasta de spam.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3
                      text-sm text-white placeholder:text-white/20 outline-none
                      focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold
                  text-white shadow-lg transition-all hover:from-emerald-500 hover:to-teal-500
                  disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-[0.98]"
                style={{ boxShadow: loading ? 'none' : '0 0 20px -5px rgba(16,185,129,0.4)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : 'Enviar instruções'}
              </button>
            </form>
          )}

          <div className="mt-6 flex justify-center">
            <Link to="/login"
              className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
