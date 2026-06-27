import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Users, Search, AlertCircle, ShieldCheck, User, HardHat,
  Lock, Unlock, Trash2, History, X, Clock,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type { AdminUser, AuditLogEntry } from '@/services/admin.service';
import { emitAdminRefresh } from '@/lib/adminEvents';
import { useAuth } from '@/hooks/useAuth';
import { fadeUp } from '@/lib/animations';
import { formatDate, formatDateTime } from '@/lib/utils';

// ── Config ────────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; cls: string; icon: typeof User }> = {
  client:   { label: 'Cliente',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20',         icon: User },
  provider: { label: 'Prestador', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: HardHat },
  admin:    { label: 'Admin',     cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20',    icon: ShieldCheck },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  active:  { label: 'Ativo',     cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  blocked: { label: 'Bloqueado', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  deleted: { label: 'Excluído',  cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

const ACTION_CONFIG: Record<string, { label: string; cls: string }> = {
  block_user:   { label: 'Bloqueio',    cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  unblock_user: { label: 'Desbloqueio', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  delete_user:  { label: 'Exclusão',   cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

const DURATION_OPTIONS = [
  { value: 1,  label: '1 dia' },
  { value: 7,  label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
];

// ── BlockModal ────────────────────────────────────────────────────────────────

function BlockModal({
  user,
  onClose,
  onSuccess,
}: {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [days, setDays] = useState(7);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleBlock() {
    setLoading(true);
    setError('');
    try {
      await adminService.blockUser(user._id, days, reason.trim() || undefined);
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Não foi possível bloquear o usuário.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0d1530 0%, #0a0f1e 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Bloquear usuário</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-white/50 mb-5">
          Bloqueando <span className="text-white font-semibold">{user.name}</span>.
          O usuário não conseguirá entrar na plataforma durante o período.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
              Duração do bloqueio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDays(opt.value)}
                  className={`rounded-xl border py-2 text-sm font-semibold transition-all ${
                    days === opt.value
                      ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                      : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
              Motivo{' '}
              <span className="text-white/20 font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Descreva o motivo do bloqueio..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-500/50 resize-none transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-white/50 hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleBlock}
              disabled={loading}
              className="flex-1 rounded-xl bg-amber-500/20 border border-amber-500/30 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/30 transition-all disabled:opacity-40"
            >
              {loading ? 'Bloqueando...' : 'Bloquear'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── DeleteModal ───────────────────────────────────────────────────────────────

function DeleteModal({
  user,
  onClose,
  onSuccess,
}: {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  async function handleDelete() {
    setLoading(true);
    setError('');
    try {
      await adminService.deleteUser(user._id);
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Não foi possível excluir o usuário.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 22 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 22 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1a0808 0%, #120505 50%, #0e0404 100%)',
          border: '1px solid rgba(239,68,68,0.22)',
          boxShadow: '0 0 0 1px rgba(239,68,68,0.08), 0 30px 60px rgba(0,0,0,0.75), 0 0 100px rgba(239,68,68,0.06)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid rgba(239,68,68,0.12)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)' }}
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Excluir usuário</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/70 mt-0.5">
                Ação irreversível
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl text-white/25 hover:text-white/80 transition-all"
            style={{ background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6 space-y-5">
          {/* Warning banner */}
          <div
            className="rounded-xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.09) 0%, rgba(220,38,38,0.05) 100%)',
              border: '1px solid rgba(239,68,68,0.18)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <span className="text-xs font-bold text-red-300 uppercase tracking-wider">Ação irreversível</span>
            </div>
            <p className="text-xs text-red-200/60 leading-relaxed">
              O usuário{' '}
              <span className="text-red-200 font-semibold">{user.name}</span>{' '}
              será marcado como excluído e não conseguirá mais acessar a plataforma.
              Os dados relacionados serão preservados para histórico e auditoria.
            </p>
          </div>

          {/* Custom checkbox */}
          <div
            className="flex items-start gap-3 cursor-pointer group select-none"
            role="checkbox"
            aria-checked={confirmed}
            tabIndex={0}
            onClick={() => setConfirmed(c => !c)}
            onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setConfirmed(c => !c); } }}
          >
            <div
              className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all duration-200 pointer-events-none"
              style={{
                border: confirmed ? '2px solid rgb(239,68,68)' : '2px solid rgba(255,255,255,0.22)',
                background: confirmed ? 'rgb(239,68,68)' : 'rgba(255,255,255,0.04)',
                boxShadow: confirmed ? '0 0 10px rgba(239,68,68,0.35)' : 'none',
              }}
            >
              <AnimatePresence>
                {confirmed && (
                  <motion.svg
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.13, type: 'spring', stiffness: 500, damping: 20 }}
                    className="h-3 w-3 text-white"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
            <span className="text-sm text-white/55 leading-relaxed group-hover:text-white/80 transition-colors">
              Entendo que esta ação não pode ser desfeita.
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl p-3" style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.08)' }}>
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white/50 hover:text-white transition-all disabled:opacity-40"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || !confirmed}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all"
              style={{
                background: confirmed && !loading ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                border: confirmed && !loading ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: confirmed && !loading ? 'rgb(252,165,165)' : 'rgba(255,255,255,0.2)',
                cursor: !confirmed || loading ? 'not-allowed' : 'pointer',
                boxShadow: confirmed && !loading ? '0 0 20px rgba(239,68,68,0.12)' : 'none',
                opacity: !confirmed || loading ? 0.55 : 1,
              }}
              onMouseEnter={e => { if (confirmed && !loading) { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.55)'; } }}
              onMouseLeave={e => { if (confirmed && !loading) { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; } }}
            >
              {loading ? 'Excluindo...' : 'Excluir usuário'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── HistoryModal ──────────────────────────────────────────────────────────────

function HistoryModal({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getUserHistory(user._id)
      .then(setLogs)
      .catch(() => setError('Não foi possível carregar o histórico.'))
      .finally(() => setLoading(false));
  }, [user._id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #0d1530 0%, #0a0f1e 100%)',
          maxHeight: '80vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            <h2 className="text-base font-bold text-white">Histórico de ações</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-white/40 mb-4 shrink-0">
          Usuário: <span className="text-white/70 font-semibold">{user.name}</span>
        </p>

        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 min-h-0">
          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="rounded-xl border border-white/5 p-3 animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="h-3 bg-white/5 rounded w-1/3 mb-2" />
                  <div className="h-2.5 bg-white/5 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-8 w-8 text-white/15 mb-3" />
              <p className="text-sm text-white/30">Nenhuma ação registrada para este usuário.</p>
            </div>
          )}

          {!loading && !error && logs.map(log => {
            const cfg = ACTION_CONFIG[log.action] ?? {
              label: log.action,
              cls: 'text-white/50 bg-white/5 border-white/10',
            };
            return (
              <div
                key={log._id}
                className="rounded-xl border border-white/5 p-3"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[11px] text-white/30">{formatDateTime(log.createdAt)}</span>
                </div>
                <p className="text-xs text-white/50">
                  Por: <span className="text-white/70">{log.adminName}</span>
                </p>
                {log.reason && (
                  <p className="text-xs text-white/40 mt-1">Motivo: {log.reason}</p>
                )}
                {log.blockedUntil && (
                  <p className="text-xs text-white/40 mt-1">
                    Até: {formatDateTime(log.blockedUntil)}
                  </p>
                )}
                <p className="text-[11px] text-white/25 mt-1">
                  {log.previousStatus} → {log.newStatus}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AdminUsersPage() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const [blockTarget, setBlockTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AdminUser | null>(null);

  function loadUsers() {
    setLoading(true);
    setError('');
    setActionError('');
    adminService.getUsers(200)
      .then(({ users: u, total: t }) => { setUsers(u); setTotal(t); })
      .catch(() => setError('Não foi possível carregar os usuários.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function handleBlockSuccess() {
    setBlockTarget(null);
    loadUsers();
    emitAdminRefresh();
  }

  function handleDeleteSuccess() {
    setDeleteTarget(null);
    loadUsers();
    emitAdminRefresh();
  }

  function handleUnblock(u: AdminUser) {
    setActionError('');
    adminService.unblockUser(u._id)
      .then(() => { loadUsers(); emitAdminRefresh(); })
      .catch((e: any) => {
        setActionError(e?.response?.data?.message ?? 'Não foi possível desbloquear o usuário.');
      });
  }

  const isSelf = (u: AdminUser) => u._id === (authUser as any)?._id;

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-400" /> Usuários
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {total} usuário{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}
          </p>
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

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{actionError}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 p-4 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
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
          {filtered.map((u, i) => {
            const RoleIcon = ROLE_CONFIG[u.role]?.icon ?? User;
            const self = isSelf(u);
            const isDeleted = u.status === 'deleted';
            return (
              <motion.div
                key={u._id}
                {...fadeUp(0.05 + i * 0.02)}
                className="flex items-center gap-4 rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/5">
                  <RoleIcon className="h-5 w-5 text-white/50" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                    {self && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-400 uppercase tracking-wider shrink-0">
                        Você
                      </span>
                    )}
                  </div>
                  {(u.city || u.state) && (
                    <p className="text-xs text-white/25">{[u.city, u.state].filter(Boolean).join(', ')}</p>
                  )}
                  {u.status === 'blocked' && u.blockedUntil && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3 text-amber-400/60" />
                      <p className="text-[11px] text-amber-400/60">Até {formatDate(u.blockedUntil)}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_CONFIG[u.role]?.cls ?? 'text-white/40 bg-white/5 border-white/10'}`}>
                    {ROLE_CONFIG[u.role]?.label ?? u.role}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[u.status]?.cls ?? 'text-white/40 bg-white/5 border-white/10'}`}>
                    {STATUS_CONFIG[u.status]?.label ?? u.status}
                  </span>

                  {!self && !isDeleted && u.status === 'active' && (
                    <button
                      onClick={() => setBlockTarget(u)}
                      className="flex items-center gap-1 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
                    >
                      <Lock className="h-3 w-3" /> Bloquear
                    </button>
                  )}
                  {!self && !isDeleted && u.status === 'blocked' && (
                    <button
                      onClick={() => handleUnblock(u)}
                      className="flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                      <Unlock className="h-3 w-3" /> Desbloquear
                    </button>
                  )}
                  {!self && !isDeleted && (
                    <button
                      onClick={() => setDeleteTarget(u)}
                      className="flex items-center gap-1 rounded-lg border border-red-500/25 bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="h-3 w-3" /> Excluir
                    </button>
                  )}
                  <button
                    onClick={() => setHistoryTarget(u)}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/40 hover:bg-white/10 hover:text-white/70 transition-all"
                  >
                    <History className="h-3 w-3" /> Histórico
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {blockTarget && (
          <BlockModal
            user={blockTarget}
            onClose={() => setBlockTarget(null)}
            onSuccess={handleBlockSuccess}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            user={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onSuccess={handleDeleteSuccess}
          />
        )}
        {historyTarget && (
          <HistoryModal
            user={historyTarget}
            onClose={() => setHistoryTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
