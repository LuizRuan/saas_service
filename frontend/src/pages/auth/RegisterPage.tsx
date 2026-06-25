import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { categoryService } from '@/services/category.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { splitByComma } from '@/lib/utils';
import type { Category } from '@/types';
import { Wrench, User, HardHat, ChevronLeft, ArrowRight } from 'lucide-react';

type Role = 'client' | 'provider';

export function RegisterPage() {
  const { registerClient, registerProvider, user } = useAuth();
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

  if (user) {
    const path = user.role === 'client' ? '/cliente' : user.role === 'provider' ? '/prestador' : '/admin';
    navigate(path, { replace: true });
    return null;
  }

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
    <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center px-4 py-12 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 pointer-events-none" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-10 w-64 h-64 bg-success/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl"
      >
        <div className="rounded-3xl border border-slate-100 bg-white p-8 sm:p-10 shadow-premium">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-light shadow-md">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {step === 0 ? 'Criar conta' : role === 'client' ? 'Cadastro de Cliente' : 'Cadastro de Prestador'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {step === 0 ? 'Selecione como você quer usar a MãoCerta' : 'Preencha seus dados para continuar'}
            </p>
          </div>

          {step === 1 && (
            <button
              onClick={() => { setStep(0); setError(''); }}
              className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors group"
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Voltar
            </button>
          )}

          {error && <Alert type="error" message={error} className="mb-5" />}

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
                  className="flex flex-col items-center gap-5 rounded-2xl border-2 border-slate-100 p-8 text-center hover:border-primary hover:bg-primary-50/50 transition-all group"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 group-hover:bg-primary/10 transition-colors">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-base mb-1">Preciso de um serviço</p>
                    <p className="text-sm text-slate-500">Publique sua demanda e receba orçamentos de profissionais</p>
                  </div>
                  <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Continuar <ArrowRight className="h-3 w-3" />
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectRole('provider')}
                  className="flex flex-col items-center gap-5 rounded-2xl border-2 border-slate-100 p-8 text-center hover:border-success hover:bg-success-50 transition-all group"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50 group-hover:bg-success/10 transition-colors">
                    <HardHat className="h-8 w-8 text-success-dark" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-base mb-1">Sou prestador de serviços</p>
                    <p className="text-sm text-slate-500">Cadastre seus serviços e encontre clientes na sua região</p>
                  </div>
                  <span className="text-xs font-medium text-success-dark flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Maria Silva" />
                  <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="maria@email.com" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" minLength={6} />
                  <Input label="Telefone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(11) 99999-0000" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="São Paulo" />
                  <Input label="Estado (sigla)" value={state} onChange={(e) => setState(e.target.value)} required placeholder="SP" maxLength={2} />
                </div>

                {/* Campos extras do prestador */}
                {role === 'provider' && (
                  <>
                    <div className="my-6 flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-100" />
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Informações profissionais</span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Nome profissional" value={professionalName} onChange={(e) => setProfessionalName(e.target.value)} required placeholder="Ex: João Eletricista" />
                      <Input label="CPF / CNPJ" value={document} onChange={(e) => setDocument(e.target.value)} required placeholder="000.000.000-00" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Bio profissional</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        placeholder="Descreva sua experiência e diferenciais..."
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-slate-400 transition-all duration-200"
                      />
                    </div>
                    <Input
                      label="Cidades de atendimento (separadas por vírgula)"
                      value={cities}
                      onChange={(e) => setCities(e.target.value)}
                      required
                      placeholder="São Paulo, Guarulhos, Santo André"
                    />
                    <Input
                      label="Bairros de atendimento (separados por vírgula)"
                      value={neighborhoods}
                      onChange={(e) => setNeighborhoods(e.target.value)}
                      placeholder="Centro, Moema, Vila Mariana"
                    />
                    {categories.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-slate-700">
                          Categorias de serviço <span className="text-danger">*</span>
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {categories.map((cat) => (
                            <label
                              key={cat._id}
                              className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 cursor-pointer text-sm transition-all duration-200 ${
                                selectedCategories.includes(cat._id)
                                  ? 'border-primary bg-primary-50 text-primary font-medium shadow-sm'
                                  : 'border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="accent-primary rounded"
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

                <Button type="submit" loading={loading} className="w-full mt-3" size="lg">
                  {role === 'client' ? 'Criar conta de cliente' : 'Enviar cadastro de prestador'}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center text-sm text-slate-500">
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
              Entrar
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
