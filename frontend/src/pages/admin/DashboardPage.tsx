import { motion } from 'framer-motion';
import { Users, Briefcase, FileText, ShieldAlert, BarChart3 } from 'lucide-react';

const STAT_CARDS = [
  { icon: Users, label: 'Usuários', color: 'from-blue-500 to-blue-600' },
  { icon: Briefcase, label: 'Prestadores', color: 'from-violet-500 to-purple-600' },
  { icon: FileText, label: 'Solicitações', color: 'from-primary to-primary-light' },
  { icon: ShieldAlert, label: 'Disputas', color: 'from-red-500 to-rose-600' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function AdminDashboardPage() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Visão geral</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Painel Administrativo</h1>
        <p className="text-slate-500 mt-1">Visão geral da plataforma MãoCerta.</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} shadow-md`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-3xl font-bold text-slate-800">—</p>
            <p className="text-sm text-slate-500 mt-1">{card.label}</p>
            <span className="mt-3 inline-flex items-center text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-full px-3 py-1 uppercase tracking-wider">
              Em breve
            </span>
          </motion.div>
        ))}
      </div>

      {/* Aviso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-card"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 mx-auto mb-4">
          <ShieldAlert className="h-8 w-8 text-slate-300" />
        </div>
        <p className="font-semibold text-slate-700 mb-1">Listagens completas em breve</p>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          As tabelas de usuários, prestadores, solicitações, ordens, pagamentos e disputas serão
          implementadas na próxima etapa.
        </p>
      </motion.div>
    </div>
  );
}
