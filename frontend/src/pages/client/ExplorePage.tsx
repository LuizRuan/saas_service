import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, Briefcase, Hammer, Zap, Paintbrush,
  Wrench, Scissors, Truck, Leaf, Monitor, Home, Wind, Droplets,
  Shield, Filter, ChevronRight, Users, X,
} from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { providerService, type ProviderCard } from '@/services/provider.service';
import type { Category } from '@/types';

/* ── Icon map ──────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  construcao: Hammer, eletrica: Zap, pintura: Paintbrush,
  hidraulica: Droplets, limpeza: Wind, jardinagem: Leaf,
  reformas: Wrench, beleza: Scissors, mudancas: Truck,
  ti: Monitor, seguranca: Shield, default: Home,
};

function getCategoryIcon(slug: string): React.ElementType {
  const key = Object.keys(ICON_MAP).find((k) => slug.includes(k));
  return key ? ICON_MAP[key] : ICON_MAP.default;
}

/* ── Star rating ───────────────────────────────────────── */
function StarRating({ value, count }: { value: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-white/15'}`}
          />
        ))}
      </div>
      <span className="text-xs text-white/40">
        {value > 0 ? `${value.toFixed(1)} (${count})` : 'Sem avaliações'}
      </span>
    </div>
  );
}

/* ── Provider Card ─────────────────────────────────────── */
function ProviderCardComponent({ provider, index }: { provider: ProviderCard; index: number }) {
  const navigate = useNavigate();
  const initials = provider.professionalName
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const GRADIENT_PAIRS = [
    ['from-blue-500', 'to-blue-600'],
    ['from-violet-500', 'to-purple-600'],
    ['from-emerald-500', 'to-teal-600'],
    ['from-amber-500', 'to-orange-600'],
    ['from-rose-500', 'to-pink-600'],
    ['from-cyan-500', 'to-blue-500'],
  ];
  const [from, to] = GRADIENT_PAIRS[index % GRADIENT_PAIRS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: 'easeOut' }}
    >
      <button
        onClick={() => navigate(`/cliente/solicitacoes/nova?providerId=${provider.userId._id}`)}
        className="group w-full text-left rounded-2xl border border-white/8 p-5 transition-all duration-300
          hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl
            bg-gradient-to-br ${from} ${to} text-white font-bold text-sm shadow-lg
            group-hover:scale-105 transition-transform duration-300`}>
            {initials}
            {provider.plan === 'premium' && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 border-2 border-slate-950 flex items-center justify-center">
                <Star className="h-2 w-2 text-slate-950 fill-slate-950" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
              {provider.professionalName}
            </p>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-white/40">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{provider.cities.slice(0, 2).join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-3">
          <StarRating value={provider.averageRating} count={provider.reviewCount} />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {provider.categories.slice(0, 3).map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            return (
              <span
                key={cat._id}
                className="flex items-center gap-1 text-[11px] font-medium text-white/50 bg-white/5
                  border border-white/8 rounded-lg px-2 py-0.5"
              >
                <Icon className="h-3 w-3" />
                {cat.name}
              </span>
            );
          })}
          {provider.categories.length > 3 && (
            <span className="text-[11px] text-white/30 px-1">+{provider.categories.length - 3}</span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/25 font-medium">Ver perfil completo</span>
          <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </button>
    </motion.div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export function ExplorePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<ProviderCard[]>([]);
  const [total, setTotal] = useState(0);

  const [cityInput, setCityInput] = useState('');
  const [appliedCity, setAppliedCity] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);

  // Load categories once
  useEffect(() => {
    categoryService.getAll()
      .then(setCategories)
      .finally(() => setCatLoading(false));
  }, []);

  // Search whenever filter changes
  const doSearch = useCallback(async (city: string, category: string) => {
    setLoading(true);
    try {
      const result = await providerService.search({
        city: city || undefined,
        category: category || undefined,
        limit: 24,
      });
      setProviders(result.providers);
      setTotal(result.pagination.total);
    } catch {
      setProviders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(appliedCity, selectedCat);
  }, [appliedCity, selectedCat, doSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedCity(cityInput.trim());
  };

  const clearFilters = () => {
    setCityInput('');
    setAppliedCity('');
    setSelectedCat('');
  };

  const hasFilters = appliedCity || selectedCat;

  return (
    <div className="relative max-w-6xl mx-auto">
      {/* Background orbs */}
      <div className="orb w-80 h-80 bg-blue-600 -top-20 -right-20 opacity-10 pointer-events-none" />
      <div className="orb w-64 h-64 bg-emerald-500 bottom-20 -left-20 opacity-8 pointer-events-none" />

      {/* ── Header ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/20">
            <Search className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <span className="text-xs font-semibold text-blue-400/80 uppercase tracking-widest">
            Marketplace
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Buscar{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                Profissionais
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Encontre o prestador ideal na sua cidade.{' '}
              {total > 0 && (
                <span className="text-white/60">
                  <strong className="text-white">{total}</strong> profissional{total !== 1 ? 'is' : ''} encontrado{total !== 1 ? 's' : ''}.
                </span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Search + Filters ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-6"
      >
        {/* City search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
          <div className="relative flex-1 max-w-md">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar por cidade (ex: São Paulo)"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5
                text-sm text-white placeholder:text-white/25 outline-none
                focus:border-blue-500/50 focus:bg-white/8 transition-all"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5
              text-sm font-semibold text-white transition-all hover:scale-105 active:scale-100"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar</span>
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-xl border border-white/8 hover:border-white/20
                px-4 py-2.5 text-sm text-white/40 hover:text-white/80 transition-all"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </form>

        {/* Active filters display */}
        <AnimatePresence>
          {hasFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {appliedCity && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-blue-300
                  bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
                  <MapPin className="h-3 w-3" />
                  {appliedCity}
                  <button onClick={() => { setAppliedCity(''); setCityInput(''); }}
                    className="hover:text-white ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCat && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-300
                  bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                  <Filter className="h-3 w-3" />
                  {categories.find(c => c._id === selectedCat)?.name ?? selectedCat}
                  <button onClick={() => setSelectedCat('')} className="hover:text-white ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category filter pills */}
        {!catLoading && categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCat('')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all
                ${!selectedCat
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'border-white/8 text-white/40 hover:border-white/15 hover:text-white/60'
                }`}
            >
              <Briefcase className="h-3 w-3" />
              Todos
            </button>
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.slug);
              const isActive = selectedCat === cat._id;
              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCat(isActive ? '' : cat._id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all
                    ${isActive
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'border-white/8 text-white/40 hover:border-white/15 hover:text-white/60'
                    }`}
                >
                  <Icon className="h-3 w-3" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Results ─────────────────────────────── */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 p-5 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-white/8 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/8 rounded-lg w-3/4" />
                  <div className="h-2 bg-white/5 rounded-lg w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-white/5 rounded-lg w-full" />
                <div className="h-2 bg-white/5 rounded-lg w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/8 mb-4">
            <Users className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="font-semibold text-white/60 mb-1">
            {hasFilters ? 'Nenhum profissional encontrado' : 'Sem prestadores disponíveis'}
          </h3>
          <p className="text-sm text-white/30 max-w-xs">
            {hasFilters
              ? 'Tente remover alguns filtros ou buscar em outra cidade.'
              : 'Os primeiros prestadores ainda estão se cadastrando na plataforma.'}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {providers.map((provider, i) => (
            <ProviderCardComponent key={provider._id} provider={provider} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
