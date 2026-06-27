import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { categoryService } from '@/services/category.service';
import { splitByComma } from '@/lib/utils';
import type { Category } from '@/types';
import { Wrench, User, HardHat, ChevronLeft, ArrowRight, AlertCircle } from 'lucide-react';

type Role = 'client' | 'provider';

export function RegisterPage() {
  const { registerClient, registerProvider } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1>(0);
  const [role, setRole] = useState<Role>('client');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Campos comuns
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Campos extras do prestador
  const [professionalName, setProfessionalName] = useState('');
  const [document, setDocument] = useState('');
  const [bio, setBio] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [cities, setCities] = useState('');
  const [neighborhoods, setNeighborhoods] = useState('');

  useEffect(() => {
    if (step === 1 && role === 'provider') {
      categoryService.getAll().then(setCategories).catch(() => {});
    }
  }, [step, role]);

  const handleSelectRole = (r: Role) => {
    setRole(r);
    setStep(1);
    setError('');
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (role === 'client') {
        await registerClient({ name, email, password, phone, city, state });
        navigate('/cliente');
      } else {
        if (selectedCategories.length === 0) {
          setError('Selecione ao menos uma categoria.');
          setLoading(false);
          return;
        }
        await registerProvider({
          name,
          email,
          password,
          phone,
          city,
          state,
          professionalName,
          document,
          bio,
          categories: selectedCategories,
          cities: splitByComma(cities),
          neighborhoods: splitByComma(neighborhoods),
        });
        navigate('/prestador');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao criar conta. Verifique os dados e tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ background: 'linear-gradient(135deg, #050912 0%, #0a0f1e 50%, #080e1c 100%)' }}
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
    >
      <div className="orb w-96 h-96 bg-emerald-500 top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]" />
      <div className="orb w-80 h-80 bg-blue-600 bottom-0 right-0 translate-x-1/3 translate-y-1/3 opacity-[0.07]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl"
      >
        <div
          className="rounded-3xl border border-white/10 p-8 sm:p-10 mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)' }}
        >
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div
              className="mb-4 relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl"
              style={{ boxShadow: '0 0 30px -5px rgba(16,185,129,0.5)' }}
            >
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {step === 0 ? 'Criar conta' : role === 'client' ? 'Cadastro de Cliente' : 'Cadastro de Prestador'}
            </h1>
            <p className="mt-1.5 text-sm text-white/40">
              {step === 0 ? 'Selecione como você quer usar a MãoCerta' : 'Preencha seus dados para continuar'}
            </p>
          </div>

          {step === 1 && (
            <button
              onClick={() => { setStep(0); setError(''); }}
              className="mb-6 flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors group"
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Voltar
            </button>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
            >
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Step 0: escolha de role */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="grid sm:grid-cols-2 gap-5"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectRole('client')}
                  className="flex flex-col items-center gap-5 rounded-2xl border-2 border-white/10 bg-white/5 p-8 text-center hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 transition-colors">
                    <User className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-base mb-1">Preciso de um serviço</p>
                    <p className="text-sm text-white/50">Publique sua demanda e receba orçamentos de profissionais</p>
                  </div>
                  <span className="text-xs font-medium text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Continuar <ArrowRight className="h-3 w-3" />
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectRole('provider')}
                  className="flex flex-col items-center gap-5 rounded-2xl border-2 border-white/10 bg-white/5 p-8 text-center hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 transition-colors">
                    <HardHat className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-base mb-1">Sou prestador de serviços</p>
                    <p className="text-sm text-white/50">Cadastre seus serviços e encontre clientes na sua região</p>
                  </div>
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Continuar <ArrowRight className="h-3 w-3" />
                  </span>
                </motion.button>
              </motion.div>
            )}

            {/* Step 1: formulário */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Nome completo</label>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Maria Silva"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">E-mail</label>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-all"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="maria@email.com"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Senha</label>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-all"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Telefone</label>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-all"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="(11) 99999-0000"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Cidade</label>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-all"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="São Paulo"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Estado (sigla)</label>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-all"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>

                {/* Campos extras do prestador */}
                {role === 'provider' && (
                  <>
                    <div className="my-6 flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">Informações profissionais</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Nome profissional</label>
                        <input
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-all"
                          value={professionalName}
                          onChange={(e) => setProfessionalName(e.target.value)}
                          required
                          placeholder="Ex: João Eletricista"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">CPF / CNPJ</label>
                        <input
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-all"
                          value={document}
                          onChange={(e) => setDocument(e.target.value)}
                          required
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Bio profissional</label>
                      <textarea
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-all resize-none"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        placeholder="Descreva sua experiência e diferenciais..."
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Cidades de atendimento (separadas por vírgula)</label>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-all"
                        value={cities}
                        onChange={(e) => setCities(e.target.value)}
                        required
                        placeholder="São Paulo, Guarulhos, Santo André"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Bairros de atendimento (separados por vírgula)</label>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-all"
                        value={neighborhoods}
                        onChange={(e) => setNeighborhoods(e.target.value)}
                        placeholder="Centro, Moema, Vila Mariana"
                      />
                    </div>
                    {categories.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-white/60">
                          Categorias de serviço <span className="text-red-400">*</span>
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {categories.map((cat) => (
                            <label
                              key={cat._id}
                              className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 cursor-pointer text-sm transition-all ${
                                selectedCategories.includes(cat._id)
                                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium'
                                  : 'border-white/10 text-white/50 hover:border-white/20 hover:bg-white/5'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="accent-emerald-500 rounded"
                                checked={selectedCategories.includes(cat._id)}
                                onChange={() => toggleCategory(cat._id)}
                              />
                              {cat.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-[0.98]"
                  style={{ boxShadow: loading ? 'none' : '0 0 20px -5px rgba(16,185,129,0.4)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Criando conta...
                    </span>
                  ) : (role === 'client' ? 'Criar conta de cliente' : 'Enviar cadastro de prestador')}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center text-sm text-white/30">
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              Entrar
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
