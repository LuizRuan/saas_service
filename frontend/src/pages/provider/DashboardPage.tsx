import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Search, FileText, ClipboardList, Star, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function ProviderDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Alert */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex items-start gap-4 rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 p-5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-amber-800">Perfil aguardando aprovação</p>
          <p className="text-sm text-amber-700/80 mt-0.5">
            Seu cadastro está em análise pela equipe MãoCerta. Assim que aprovado, você poderá
            visualizar pedidos e enviar orçamentos.
          </p>
        </div>
      </motion.div>

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-success-dark">Área do prestador</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Olá, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-slate-500 mt-1">
          Veja os pedidos disponíveis na sua região e envie orçamentos para conquistar novos clientes.
        </p>
      </motion.div>

      {/* CTA principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <Link
          to="/prestador/pedidos"
          className="group mb-8 flex items-center gap-5 rounded-2xl bg-gradient-to-r from-primary to-primary-light p-6 sm:p-7 text-white shadow-premium hover:shadow-lg transition-all"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 group-hover:bg-white/20 transition-colors">
            <Search className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg sm:text-xl">Ver pedidos disponíveis</p>
            <p className="text-white/70 text-sm mt-0.5">
              Encontre pedidos de clientes na sua região e envie seus orçamentos
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
        </Link>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        {[
          {
            to: '/prestador/pedidos',
            icon: Search,
            bg: 'bg-gradient-to-br from-primary to-primary-light',
            title: 'Pedidos disponíveis',
            desc: 'Veja pedidos de clientes na sua região e envie orçamentos.',
          },
          {
            to: '/prestador/orcamentos',
            icon: FileText,
            bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
            title: 'Meus orçamentos',
            desc: 'Acompanhe os orçamentos enviados e seus status.',
          },
        ].map((card, i) => (
          <motion.div key={card.to} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <Link
              to={card.to}
              className="group block rounded-2xl border border-slate-100 bg-white p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} shadow-md`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-primary transition-colors">{card.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
            </Link>
          </motion.div>
        ))}

        {[
          { icon: ClipboardList, title: 'Minhas ordens', desc: 'Gerencie os serviços em andamento e concluídos.' },
          { icon: Star, title: 'Avaliações', desc: 'Veja o que os clientes dizem sobre o seu trabalho.' },
        ].map((card, i) => (
          <motion.div key={card.title} custom={i + 2} variants={cardVariants} initial="hidden" animate="visible">
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 opacity-50 cursor-not-allowed">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200">
                <card.icon className="h-5 w-5 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-1">{card.title}</h3>
              <p className="text-sm text-slate-400">{card.desc}</p>
              <span className="mt-3 inline-flex items-center text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-full px-3 py-1 uppercase tracking-wider">
                Em breve
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
