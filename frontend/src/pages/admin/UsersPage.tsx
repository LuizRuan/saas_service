import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, AlertCircle, ShieldCheck, UserX, User, HardHat } from 'lucide-react';
import api from '@/lib/axios';
import { fadeUp } from '@/lib/animations';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'provider' | 'admin';
  status: 'active' | 'blocked';
  city?: string;
  state?: string;
  createdAt: string;
}

const ROLE_CONFIG = {
  client:   { label: 'Cliente',    cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20',     icon: User },
  provider: { label: 'Prestador',  cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: HardHat },
  admin:    { label: 'Admin',      cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20', icon: ShieldCheck },
};

const STATUS_CONFIG = {
  active:  { label: 'Ativo',     cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  blocked: { label: 'Bloqueado', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api.get('/admin/users?limit=100', { signal: controller.signal })
      .then(res => {
        setUsers(res.data.data.users ?? res.data.data ?? []);
        setTotal(res.data.data.total ?? res.data.data?.length ?? 0);
      })
      .catch(() => { if (!controller.signal.aborted) setError('Não foi possível carregar os usuários.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-400" /> Usuários
          </h1>
          <p className="text-sm text-white/40 mt-1">{total} usuário{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5
            text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-all"
        />
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-2.5 bg-white/5 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <motion.div {...fadeUp(0.1)} className="space-y-2">
          {filtered.map((user, i) => {
            const RoleIcon = ROLE_CONFIG[user.role]?.icon ?? User;
            return (
              <motion.div key={user._id} {...fadeUp(0.05 + i * 0.02)}
                className="flex items-center gap-4 rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/5">
                  <RoleIcon className="h-4.5 w-4.5 h-5 w-5 text-white/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/35 truncate">{user.email}</p>
                  {(user.city || user.state) && (
                    <p className="text-xs text-white/25">{[user.city, user.state].filter(Boolean).join(', ')}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_CONFIG[user.role]?.cls}`}>
                    {ROLE_CONFIG[user.role]?.label}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[user.status]?.cls}`}>
                    {STATUS_CONFIG[user.status]?.label ?? user.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
