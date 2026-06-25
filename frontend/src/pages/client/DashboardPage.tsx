import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { FileText, ClipboardList, CreditCard, Plus, Compass, ArrowRight, Sparkles } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function ClientDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-success-dark">Bem-vindo de volta</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Olá, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-slate-500 mt-1">
          Descreva o que precisa, receba orçamentos e escolha o melhor prestador.
        </p>
      </motion.div>

      {/* CTA principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Link
          to="/cliente/solicitacoes/nova"
          className="group mb-8 flex items-center gap-5 rounded-2xl bg-gradient-to-r from-primary to-primary-light p-6 sm:p-7 text-white shadow-premium hover:shadow-lg transition-all"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 group-hover:bg-white/20 transition-colors">
            <Plus className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg sm:text-xl">Publicar serviço que preciso</p>
            <p className="text-white/70 text-sm mt-0.5">
              Descreva o serviço, receba orçamentos e escolha o melhor prestador
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
        </Link>
      </motion.div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {[
          {
            to: '/cliente/solicitacoes',
            icon: FileText,
            bg: 'bg-blue-500',
            title: 'Minhas solicitações',
            desc: 'Acompanhe os pedidos publicados e os orçamentos recebidos.',
          },
          {
            to: '/cliente/explorar',
            icon: Compass,
            bg: 'bg-emerald-500',
            title: 'Explorar categorias',
            desc: 'Navegue pelas categorias de serviço disponíveis na plataforma.',
          },
          {
            to: '/cliente/ordens',
            icon: ClipboardList,
            bg: 'bg-violet-500',
            title: 'Minhas ordens',
            desc: 'Acompanhe os serviços em andamento e já concluídos.',
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

        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 opacity-50 cursor-not-allowed">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200">
              <CreditCard className="h-5 w-5 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Pagamentos</h3>
            <p className="text-sm text-slate-400">Histórico de sinais e pagamentos realizados.</p>
            <span className="mt-3 inline-flex items-center text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-full px-3 py-1 uppercase tracking-wider">
              Em breve
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
