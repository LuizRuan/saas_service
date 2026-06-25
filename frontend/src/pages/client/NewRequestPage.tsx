import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hammer, Zap, Paintbrush, Droplets, Wind, Leaf, Wrench,
  Scissors, Truck, Monitor, Shield, Home, MapPin, Lock,
  Calendar, AlertCircle, Send, Flame, Image, X, ChevronRight,
} from 'lucide-react';
import { categoryService } from '@/services/category.service';
import type { Category, Urgency } from '@/types';
import { Textarea } from '@/components/ui/Textarea';
import api from '@/lib/axios';

/* ── Category maps ─────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  construcao: Hammer, eletrica: Zap, pintura: Paintbrush, hidraulica: Droplets,
  limpeza: Wind, jardinagem: Leaf, reformas: Wrench, beleza: Scissors,
  mudancas: Truck, ti: Monitor, seguranca: Shield, default: Home,
};
const GRADIENT_MAP: Record<string, string> = {
  construcao: 'from-orange-500 to-amber-600', eletrica: 'from-yellow-400 to-amber-500',
  pintura: 'from-pink-500 to-rose-600', hidraulica: 'from-blue-500 to-cyan-600',
  limpeza: 'from-teal-400 to-cyan-500', jardinagem: 'from-green-500 to-emerald-600',
  reformas: 'from-violet-500 to-purple-600', beleza: 'from-rose-400 to-pink-500',
  mudancas: 'from-amber-500 to-orange-600', ti: 'from-blue-400 to-indigo-600',
  seguranca: 'from-red-500 to-rose-600', default: 'from-slate-500 to-slate-600',
};
const GLOW_MAP: Record<string, string> = {
  construcao: 'rgba(249,115,22,0.35)', eletrica: 'rgba(250,204,21,0.35)',
  pintura: 'rgba(236,72,153,0.35)', hidraulica: 'rgba(59,130,246,0.35)',
  limpeza: 'rgba(45,212,191,0.35)', jardinagem: 'rgba(34,197,94,0.35)',
  reformas: 'rgba(139,92,246,0.35)', default: 'rgba(99,102,241,0.35)',
};
function getSlugKey(slug: string) {
  return Object.keys(ICON_MAP).find(k => slug.includes(k)) ?? 'default';
}

const URGENCY_OPTIONS = [
  { value: 'low',    label: 'Baixa',  icon: Leaf,  desc: 'Pode aguardar',       cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  { value: 'medium', label: 'Média',  icon: Wind,  desc: 'Em alguns dias',      cls: 'border-amber-500/30   bg-amber-500/10   text-amber-400'   },
  { value: 'high',   label: 'Alta',   icon: Flame, desc: 'O mais rápido possível', cls: 'border-red-500/30 bg-red-500/10 text-red-400' },
];

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const },
});

interface LocationState { categoryId?: string; city?: string }

// IBGE municipality autocomplete — usa endpoint com filtro por nome para evitar carregar 5570 municípios
function useCitySearch(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timer.current);
    if (query.length < 2) { setSuggestions([]); return; }
    const controller = new AbortController();
    timer.current = setTimeout(async () => {
      try {
        const encoded = encodeURIComponent(query);
        const res = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?nome=${encoded}&orderBy=nome`,
          { signal: controller.signal }
        );
        const data: { nome: string; microrregiao: { mesorregiao: { UF: { sigla: string } } } }[] = await res.json();
        const formatted = data
          .slice(0, 8)
          .map(m => `${m.nome} — ${m.microrregiao.mesorregiao.UF.sigla}`);
        setSuggestions(formatted);
      } catch (e: any) {
        if (e?.name !== 'AbortError') setSuggestions([]);
      }
    }, 350);
    return () => controller.abort();
  }, [query]);

  return suggestions;
}

export function NewRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as LocationState) ?? {};

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [categoryId, setCategoryId] = useState(prefill.categoryId ?? '');
  const [cityInput, setCityInput] = useState(prefill.city ?? '');
  const [cityValid, setCityValid] = useState(!!prefill.city);
  const [showCitySugg, setShowCitySugg] = useState(false);
  const [neighborhood, setNeighborhood] = useState('');
  const [approximateAddress, setApproximateAddress] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('medium');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const citySuggestions = useCitySearch(cityValid ? '' : cityInput);

  useEffect(() => {
    categoryService.getAll()
      .then(setCategories)
      .catch(() => setError('Não foi possível carregar as categorias.'))
      .finally(() => setLoadingCats(false));
  }, []);

  // Revoga URLs antigas antes de criar novas para evitar memory leak
  const updatePhotoPreviews = useCallback((newPhotos: File[]) => {
    setPhotoPreviews(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return newPhotos.map(f => URL.createObjectURL(f));
    });
  }, []);

  // Revoga todas as URLs ao desmontar o componente
  useEffect(() => {
    return () => {
      setPhotoPreviews(prev => {
        prev.forEach(url => URL.revokeObjectURL(url));
        return [];
      });
    };
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - photos.length);
    const newPhotos = [...photos, ...files].slice(0, 3);
    setPhotos(newPhotos);
    updatePhotoPreviews(newPhotos);
  };

  const removePhoto = (i: number) => {
    const np = photos.filter((_, idx) => idx !== i);
    setPhotos(np);
    updatePhotoPreviews(np);
  };

  const selectCity = (name: string) => {
    setCityInput(name);
    setCityValid(true);
    setShowCitySugg(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!categoryId || !cityInput || !description) {
      setError('Preencha os campos obrigatórios: categoria, cidade e descrição.');
      return;
    }
    if (!cityValid) {
      setError('Selecione uma cidade válida da lista de sugestões.');
      return;
    }
    if (dateStart && dateEnd && dateEnd < dateStart) {
      setError('A data final não pode ser anterior à data inicial.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      const cityName = cityInput.split(' — ')[0]; // remove UF suffix
      formData.append('categoryId', categoryId);
      formData.append('city', cityName);
      formData.append('description', description);
      formData.append('urgency', urgency);
      if (neighborhood) formData.append('neighborhood', neighborhood);
      if (approximateAddress) formData.append('approximateAddress', approximateAddress);
      if (fullAddress) formData.append('fullAddress', fullAddress);
      if (dateStart) formData.append('desiredDate', dateStart);
      if (dateEnd) formData.append('desiredDateEnd', dateEnd);
      photos.forEach(f => formData.append('photos', f));

      await api.post('/service-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/cliente/solicitacoes');
    } catch {
      setError('Não foi possível criar a solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

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
        <h1 className="text-3xl font-bold text-white">Publicar <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">serviço</span></h1>
        <p className="text-slate-400 text-sm mt-1">Descreva o que precisa e receba orçamentos de profissionais.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 1: Categoria */}
        <motion.div {...fadeUp(0.05)}>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-[10px] font-bold text-white/60">1</span>
            <p className="text-sm font-semibold text-white/70">Qual tipo de serviço você precisa? *</p>
          </div>
          {loadingCats ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl border border-white/5 h-24 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }} />)}
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
                  <motion.button key={cat._id} type="button"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 + i * 0.03 }}
                    onClick={() => setCategoryId(isSelected ? '' : cat._id)}
                    className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 py-4 text-center
                      transition-all duration-200 hover:-translate-y-0.5 overflow-hidden
                      ${isSelected ? 'border-white/25 scale-[1.03]' : 'border-white/8 hover:border-white/15'}`}
                    style={{ background: isSelected ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)', boxShadow: isSelected ? `0 0 20px -5px ${glow}` : 'none' }}
                  >
                    {isSelected && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(circle at center, ${glow} 0%, transparent 70%)` }} />}
                    <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md transition-all ${isSelected ? 'scale-110' : 'opacity-70'}`} style={{ boxShadow: isSelected ? `0 6px 16px -4px ${glow}` : 'none' }}>
                      <Icon className="h-[18px] w-[18px] text-white" />
                    </div>
                    <span className={`relative text-[11px] font-semibold leading-tight transition-colors ${isSelected ? 'text-white' : 'text-white/45'}`}>{cat.name}</span>
                    {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400" />}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* STEP 2: Localização */}
        <motion.div {...fadeUp(0.12)}>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-[10px] font-bold text-white/60">2</span>
            <p className="text-sm font-semibold text-white/70">Onde será o serviço? *</p>
          </div>
          <div className="rounded-2xl border border-white/8 p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>

            {/* City autocomplete */}
            <div>
              <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Cidade *</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={e => { setCityInput(e.target.value); setCityValid(false); setShowCitySugg(true); }}
                  onFocus={() => setShowCitySugg(true)}
                  onBlur={() => setTimeout(() => setShowCitySugg(false), 200)}
                  placeholder="Digite o nome da cidade..."
                  className={`w-full rounded-xl border bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:bg-white/[0.08] transition-all ${cityValid ? 'border-emerald-500/40' : 'border-white/10 focus:border-blue-500/50'}`}
                />
                {cityValid && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-bold">✓</span>}
                <AnimatePresence>
                  {showCitySugg && citySuggestions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute z-50 w-full mt-1 rounded-xl border border-white/10 overflow-hidden shadow-2xl"
                      style={{ background: 'rgba(10,15,30,0.97)', backdropFilter: 'blur(12px)' }}>
                      {citySuggestions.map(s => (
                        <button key={s} type="button" onMouseDown={() => selectCity(s)}
                          className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/8 hover:text-white transition-colors flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-white/30 shrink-0" />{s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {!cityValid && cityInput.length >= 2 && citySuggestions.length === 0 && (
                  <p className="text-xs text-amber-400/70 mt-1.5 flex items-center gap-1.5"><AlertCircle className="h-3 w-3" />Cidade não encontrada. Verifique o nome.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Bairro</label>
                <input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Ex: Centro"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Endereço aprox.</label>
                <input value={approximateAddress} onChange={e => setApproximateAddress(e.target.value)} placeholder="Ex: Rua das Flores"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
                <Lock className="inline h-3 w-3 mr-1" />Endereço completo (privado)
              </label>
              <input value={fullAddress} onChange={e => setFullAddress(e.target.value)} placeholder="Visível apenas para o prestador selecionado"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all" />
              <p className="text-xs text-white/25 mt-1.5">Só revelado após aceitar um orçamento.</p>
            </div>
          </div>
        </motion.div>

        {/* STEP 3: Descrição + Fotos */}
        <motion.div {...fadeUp(0.18)}>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-[10px] font-bold text-white/60">3</span>
            <p className="text-sm font-semibold text-white/70">Descreva o serviço *</p>
          </div>
          <div className="rounded-2xl border border-white/8 p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <Textarea label="Descrição detalhada" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Descreva o serviço: tamanho, material, condições do local..." rows={5}
              hint={`${description.length} / 2000 caracteres`} />

            {/* Photo upload */}
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2.5">Fotos (máx. 3)</p>
              <div className="flex flex-wrap gap-3">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden border border-white/10 group">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <label className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-dashed border-white/15
                    bg-white/[0.02] text-white/25 hover:border-white/30 hover:text-white/50 cursor-pointer transition-all">
                    <Image className="h-5 w-5 mb-1" />
                    <span className="text-[10px]">Adicionar</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* STEP 4: Urgência + Período */}
        <motion.div {...fadeUp(0.24)}>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-[10px] font-bold text-white/60">4</span>
            <p className="text-sm font-semibold text-white/70">Urgência e período preferido</p>
          </div>
          <div className="rounded-2xl border border-white/8 p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2.5">Urgência *</p>
              <div className="grid grid-cols-3 gap-2">
                {URGENCY_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = urgency === opt.value;
                  return (
                    <button key={opt.value} type="button" onClick={() => setUrgency(opt.value as Urgency)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200
                        ${isSelected ? opt.cls + ' scale-[1.03]' : 'border-white/8 text-white/30 hover:border-white/15'}`}>
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-bold">{opt.label}</span>
                      <span className="text-[10px] opacity-70">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date range */}
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2.5">
                <Calendar className="inline h-3 w-3 mr-1" />Período desejado (opcional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-white/30 mb-1">Data inicial</label>
                  <input type="date" value={dateStart} min={today} onChange={e => setDateStart(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none
                      focus:border-blue-500/50 focus:bg-white/8 transition-all [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] text-white/30 mb-1">Data final</label>
                  <input type="date" value={dateEnd} min={dateStart || today} onChange={e => setDateEnd(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none
                      focus:border-blue-500/50 focus:bg-white/8 transition-all [color-scheme:dark]" />
                </div>
              </div>
              {dateStart && dateEnd && (
                <p className="text-xs text-emerald-400/70 mt-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />Período: {new Date(dateStart + 'T12:00').toLocaleDateString('pt-BR')} a {new Date(dateEnd + 'T12:00').toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(0.30)} className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/cliente/solicitacoes')}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white/40 hover:border-white/20 hover:text-white/70 transition-all">
            Cancelar
          </button>
          <button type="submit" disabled={submitting || !categoryId || !cityInput || !description}
            className="flex-[2] relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white
              bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
              disabled:opacity-40 disabled:cursor-not-allowed transition-all overflow-hidden group"
            style={{ boxShadow: (!submitting && categoryId && cityInput && description) ? '0 0 20px -5px rgba(16,185,129,0.5)' : 'none' }}>
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            {submitting
              ? <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publicando...</>
              : <><Send className="h-4 w-4" /> Publicar solicitação <ChevronRight className="h-4 w-4 opacity-60" /></>}
          </button>
        </motion.div>

        {/* Progress */}
        <motion.div {...fadeUp(0.35)} className="flex items-center justify-center gap-2 pb-2">
          {[{ filled: !!categoryId, label: 'Categoria' }, { filled: !!cityInput && cityValid, label: 'Local' }, { filled: !!description, label: 'Descrição' }].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className={`h-1.5 w-6 rounded-full transition-all duration-300 ${s.filled ? 'bg-emerald-500' : 'bg-white/10'}`} />
              <span className={`text-[10px] transition-colors ${s.filled ? 'text-emerald-400/70' : 'text-white/20'}`}>{s.label}</span>
            </div>
          ))}
        </motion.div>
      </form>
    </div>
  );
}
