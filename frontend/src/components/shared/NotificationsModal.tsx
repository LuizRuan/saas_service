import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellOff, X, AlertCircle, CheckCircle2, ClipboardList,
  DollarSign, FileText, MessageSquare, ShieldAlert, Star, UserCheck,
  ArrowRight, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { buildNotifications } from '@/services/notification.service';
import { formatDate } from '@/lib/utils';
import type { AppNotification, NotificationType } from '@/types/notification';

type Tab = 'all' | 'important' | 'recent';

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
  onLoaded?: (count: number) => void;
}

const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  provider_pending: UserCheck,
  new_request:     FileText,
  quote_received:  MessageSquare,
  quote_accepted:  CheckCircle2,
  order_created:   ClipboardList,
  order_action:    AlertCircle,
  order_completed: Star,
  payment:         DollarSign,
  dispute:         ShieldAlert,
  system:          Bell,
};

const PRIORITY_BADGE: Record<AppNotification['priority'], string> = {
  high:   'bg-red-500/15 text-red-400 border border-red-500/20',
  medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  low:    'bg-slate-500/15 text-slate-400 border border-slate-500/20',
};

const PRIORITY_LABEL: Record<AppNotification['priority'], string> = {
  high:   'Alta',
  medium: 'Média',
  low:    'Baixa',
};

const ROLE_SUBTITLE: Record<string, string> = {
  admin:    'Acompanhe alertas importantes da plataforma.',
  client:   'Veja atualizações sobre seus serviços.',
  provider: 'Acompanhe oportunidades e ordens de serviço.',
};

function isWithin24h(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 24 * 3600 * 1000;
}

function NotificationCard({ notif, onNavigate }: { notif: AppNotification; onNavigate: (href?: string) => void }) {
  const Icon = TYPE_ICON[notif.type] ?? Bell;

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onNavigate(notif.href)}
      className="w-full text-left flex items-start gap-3 rounded-2xl border border-white/5 p-4
        hover:border-white/15 hover:bg-white/[0.04] transition-all duration-200 group"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/8 border border-white/8 group-hover:bg-white/12 transition-colors">
        <Icon className="h-4 w-4 text-white/60" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-white/90 leading-snug">{notif.title}</p>
          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[notif.priority]}`}>
            {PRIORITY_LABEL[notif.priority]}
          </span>
        </div>
        <p className="text-xs text-white/45 leading-relaxed line-clamp-2">{notif.description}</p>
        {notif.date && (
          <p className="text-[10px] text-white/25 mt-1.5">{formatDate(notif.date)}</p>
        )}
      </div>

      {notif.href && (
        <ChevronRight className="h-4 w-4 text-white/20 shrink-0 mt-1 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
      )}
    </motion.button>
  );
}

export function NotificationsModal({ open, onClose, onLoaded }: NotificationsModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    setError(false);
    buildNotifications(user.role)
      .then(list => {
        setNotifications(list);
        onLoaded?.(list.length);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = (() => {
    if (tab === 'important') return notifications.filter(n => n.priority === 'high');
    if (tab === 'recent') {
      const recent = notifications.filter(n => isWithin24h(n.date));
      return recent.length > 0 ? recent : notifications.slice(0, 5);
    }
    return notifications;
  })();

  function handleNavigate(href?: string) {
    onClose();
    if (href) navigate(href);
  }

  const subtitle = ROLE_SUBTITLE[user?.role ?? ''] ?? '';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            style={{ background: 'rgba(10,15,30,0.97)', backdropFilter: 'blur(24px)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Bell className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">Notificações</h2>
                  {notifications.length > 0 && (
                    <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-400 px-1.5">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40">{subtitle}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/8 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 px-6 py-3 border-b border-white/5">
              {(['all', 'important', 'recent'] as Tab[]).map(t => {
                const labels = { all: 'Todas', important: 'Importantes', recent: 'Recentes' };
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      tab === t
                        ? 'bg-white/10 text-white'
                        : 'text-white/35 hover:text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="px-4 py-3 max-h-[420px] overflow-y-auto scrollbar-thin space-y-2">
              {loading && (
                <>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/5 p-4 animate-pulse"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="h-9 w-9 rounded-xl bg-white/8 shrink-0" />
                      <div className="flex-1 space-y-2 pt-0.5">
                        <div className="h-3.5 bg-white/8 rounded w-3/4" />
                        <div className="h-3 bg-white/5 rounded w-full" />
                        <div className="h-2.5 bg-white/5 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </>
              )}

              {!loading && error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 my-2">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  <p className="text-sm text-amber-300">Não foi possível carregar as notificações.</p>
                </div>
              )}

              {!loading && !error && filtered.length === 0 && (
                <div className="flex flex-col items-center text-center py-10 px-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/8 mb-4">
                    <BellOff className="h-6 w-6 text-white/25" />
                  </div>
                  <p className="text-sm font-semibold text-white/50 mb-1">Nenhuma notificação no momento</p>
                  <p className="text-xs text-white/25 max-w-[200px] leading-relaxed">
                    Quando houver novas atualizações importantes, elas aparecerão aqui.
                  </p>
                </div>
              )}

              {!loading && !error && filtered.map((notif, i) => (
                <motion.div key={notif.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}>
                  <NotificationCard notif={notif} onNavigate={handleNavigate} />
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            {!loading && !error && notifications.length > 0 && (
              <div className="px-6 py-3 border-t border-white/5 flex justify-end">
                <button
                  onClick={onClose}
                  className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  Fechar <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
