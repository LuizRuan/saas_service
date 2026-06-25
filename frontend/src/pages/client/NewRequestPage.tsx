import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hammer, Zap, Paintbrush, Droplets, Wind, Leaf, Wrench,
  Scissors, Truck, Monitor, Shield, Home, MapPin, AlignLeft,
  Calendar, AlertCircle, Lock, ChevronRight, Send, Flame,
} from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { serviceRequestService } from '@/services/serviceRequest.service';
import type { Category, CreateServiceRequestData, Urgency } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

/* ── Category icon map ─────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  construcao: Hammer, eletrica: Zap, pintura: Paintbrush,
  hidraulica: Droplets, limpeza: Wind, jardinagem: Leaf,
  reformas: Wrench, beleza: Scissors, mudancas: Truck,
  ti: Monitor, seguranca: Shield, default: Home,
};
const GRADIENT_MAP: Record<string, string> = {
  construcao: 'from-orange-500 to-amber-600',
  eletrica:   'from-yellow-400 to-amber-500',
  pintura:    'from-pink-500 to-rose-600',
  hidraulica: 'from-blue-500 to-cyan-600',
  limpeza:    'from-teal-400 to-cyan-500',
  jardinagem: 'from-green-500 to-emerald-600',
  reformas:   'from-violet-500 to-purple-600',
  beleza:     'from-rose-400 to-pink-500',
  mudancas:   'from-amber-500 to-orange-600',
  ti:         'from-blue-400 to-indigo-600',
  seguranca:  'from-red-500 to-rose-600',
  default:    'from-slate-500 to-slate-600',
};
const GLOW_MAP: Record<string, string> = {
  construcao: 'rgba(249,115,22,0.35)',
  eletrica:   'rgba(250,204,21,0.35)',
  pintura:    'rgba(236,72,153,0.35)',
  hidraulica: 'rgba(59,130,246,0.35)',
  limpeza:    'rgba(45,212,191,0.35)',
  jardinagem: 'rgba(34,197,94,0.35)',
  reformas:   'rgba(139,92,246,0.35)',
  default:    'rgba(99,102,241,0.35)',
};
function getSlugKey(slug: string) {
  return Object.keys(ICON_MAP).find(k => slug.includes(k)) ?? 'default';
}

/* ── Urgency config ────────────────────────────────── */
const URGENCY_OPTIONS = [
  { value: 'low',    label: 'Baixa',  icon: Leaf,  desc: 'Pode aguardar',    cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  { value: 'medium', label: 'Média',  icon: Wind,  desc: 'Em alguns dias',   cls: 'border-amber-500/30   bg-amber-500/10   text-amber-400'   },
  { value: 'high',   label: 'Alta',   icon: Flame, desc: 'O mais rápido possível', cls: 'border-red-500/30 bg-red-500/10 text-red-400' },
];

interface LocationState { categoryId?: string; city?: string }

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const },
});

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
    categoryService.getAll()
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
        categoryId, city, description, urgency,
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

  const selectedCat = categories.find(c => c._id === categoryId);
  const selectedCatKey = selectedCat ? getSlugKey(selectedCat.slug) : 'default';

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="orb w-72 h-72 bg-emerald-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      {/* Header */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/20">
            <Send className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-emerald-400/80 uppercase tracking-widest">Nova Solicitação</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Publicar{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">serviço</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Descreva o que precisa e receba orçamentos de profissionais.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STEP 1: Categoria ────────────────── */}
        <motion.div {...fadeUp(0.05)}>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-[10px] font-bold text-white/60">1</span>
            <p className="text-sm font-semibold text-white/70">Qual tipo de serviço você precisa? *</p>
          </div>

          {loadingCats ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 h-24 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {categories.map((cat, i) => {
                const key = getSlugKey(cat.slug);
                const Icon = ICON_MAP[key];
                const gradient = GRADIENT_MAP[key] ?? GRADIENT_MAP.default;
                const glow = GLOW_MAP[key] ?? GLOW_MAP.default;
                const isSelected = categoryId === cat._id;
                return (
                  <motion.button
                    key={cat._id} type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 + i * 0.03, duration: 0.25 }}
                    onClick={() => setCategoryId(isSelected ? '' : cat._id)}
                    className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 py-4 text-center
                      transition-all duration-200 hover:-translate-y-0.5 overflow-hidden
                      ${isSelected
                        ? 'border-white/25 scale-[1.03]'
                        : 'border-white/8 hover:border-white/15'
                      }`}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))`
                        : 'rgba(255,255,255,0.02)',
                      boxShadow: isSelected ? `0 0 20px -5px ${glow}` : 'none',
                    }}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: `radial-gradient(circle at center, ${glow} 0%, transparent 70%)` }}
                      />
                    )}
                    <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl
                      bg-gradient-to-br ${gradient} shadow-md
                      ${isSelected ? 'scale-110' : 'opacity-70'} transition-all duration-200`}
                      style={{ boxShadow: isSelected ? `0 6px 16px -4px ${glow}` : 'none' }}>
                      <Icon className="h-4.5 w-4.5 text-white h-[18px] w-[18px]" />
                    </div>
                    <span className={`relative text-[11px] font-semibold leading-tight transition-colors
                      ${isSelected ? 'text-white' : 'text-white/45'}`}>
                      {cat.name}
                    </span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── STEP 2: Localização ──────────────── */}
        <motion.div {...fadeUp(0.12)}>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-[10px] font-bold text-white/60">2</span>
            <p className="text-sm font-semibold text-white/70">Onde será o serviço? *</p>
          </div>
          <div className="rounded-2xl border border-white/8 p-5 space-y-4"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <Input label="Cidade *" value={city} onChange={e => setCity(e.target.value)}
              placeholder="Ex: São Paulo" icon={<MapPin className="h-4 w-4" />} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Bairro" value={neighborhood} onChange={e => setNeighborhood(e.target.value)}
                placeholder="Opcional" />
              <Input label="Endereço aproximado" value={approximateAddress}
                onChange={e => setApproximateAddress(e.target.value)} placeholder="Ex: Rua das Flores, 100" />
            </div>
            <Input label="Endereço completo (privado)" value={fullAddress}
              onChange={e => setFullAddress(e.target.value)}
              placeholder="Visível apenas para o prestador selecionado"
              icon={<Lock className="h-4 w-4" />}
              hint="Só será revelado após você aceitar um orçamento." />
          </div>
        </motion.div>

        {/* ── STEP 3: Descrição ───────────────── */}
        <motion.div {...fadeUp(0.18)}>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-[10px] font-bold text-white/60">3</span>
            <p className="text-sm font-semibold text-white/70">Descreva o serviço *</p>
          </div>
          <div className="rounded-2xl border border-white/8 p-5"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <Textarea label="Descrição detalhada" value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o que você precisa: tamanho, material, urgência, condições do local..."
              rows={5} hint={`${description.length} caracteres`} />
          </div>
        </motion.div>

        {/* ── STEP 4: Urgência + Data ─────────── */}
        <motion.div {...fadeUp(0.24)}>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-[10px] font-bold text-white/60">4</span>
            <p className="text-sm font-semibold text-white/70">Urgência e prazo</p>
          </div>
          <div className="rounded-2xl border border-white/8 p-5 space-y-4"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            {/* Urgency pills */}
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2.5">Urgência *</p>
              <div className="grid grid-cols-3 gap-2">
                {URGENCY_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = urgency === opt.value;
                  return (
                    <button key={opt.value} type="button" onClick={() => setUrgency(opt.value as Urgency)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200
                        ${isSelected ? opt.cls + ' scale-[1.03]' : 'border-white/8 text-white/30 hover:border-white/15 hover:text-white/50'}`}>
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-bold">{opt.label}</span>
                      <span className="text-[10px] opacity-70">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Input label="Data desejada (opcional)" type="date" value={desiredDate}
              onChange={e => setDesiredDate(e.target.value)} icon={<Calendar className="h-4 w-4" />} />
          </div>
        </motion.div>

        {/* ── CTA ─────────────────────────────── */}
        <motion.div {...fadeUp(0.30)} className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/cliente/solicitacoes')}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white/40
              hover:border-white/20 hover:text-white/70 transition-all">
            Cancelar
          </button>
          <button type="submit" disabled={submitting || !categoryId || !city || !description}
            className="flex-[2] relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white
              bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
              disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden group"
            style={{ boxShadow: (submitting || !categoryId || !city || !description) ? 'none' : '0 0 20px -5px rgba(16,185,129,0.5)' }}
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {submitting ? (
              <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publicando...</>
            ) : (
              <><Send className="h-4 w-4" /> Publicar solicitação <ChevronRight className="h-4 w-4 opacity-60" /></>
            )}
          </button>
        </motion.div>

        {/* Progress indicator */}
        <motion.div {...fadeUp(0.35)} className="flex items-center justify-center gap-1.5 pb-2">
          {[
            { filled: !!categoryId, label: 'Categoria' },
            { filled: !!city,       label: 'Local' },
            { filled: !!description,label: 'Descrição' },
          ].map(step => (
            <div key={step.label} className="flex items-center gap-1.5">
              <div className={`h-1.5 w-6 rounded-full transition-all duration-300 ${step.filled ? 'bg-emerald-500' : 'bg-white/10'}`} />
              <span className={`text-[10px] transition-colors ${step.filled ? 'text-emerald-400/70' : 'text-white/20'}`}>{step.label}</span>
            </div>
          ))}
        </motion.div>
      </form>
    </div>
  );
}
