import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, ClipboardList, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-surface-800">
          Olá, {user?.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-surface-600 mt-1">O que você precisa hoje?</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Nova solicitação', desc: 'Solicite um serviço agora', icon: <PlusCircle className="w-6 h-6 text-primary-800" />, to: '/cliente/solicitar', primary: true },
          { label: 'Minhas solicitações', desc: 'Acompanhe seus pedidos', icon: <FileText className="w-6 h-6 text-surface-600" />, to: '/cliente/solicitacoes', primary: false },
          { label: 'Ordens de serviço', desc: 'Serviços em andamento', icon: <ClipboardList className="w-6 h-6 text-surface-600" />, to: '/cliente/ordens', primary: false },
        ].map((item) => (
          <Card
            key={item.label}
            hover
            padding="md"
            className={item.primary ? 'border-primary-200 bg-primary-50' : ''}
            onClick={() => navigate(item.to)}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${item.primary ? 'bg-primary-100' : 'bg-surface-100'}`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-surface-800 text-sm">{item.label}</p>
                <p className="text-xs text-surface-600 mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-surface-300 mt-0.5" />
            </div>
          </Card>
        ))}
      </div>

      {/* Recent requests placeholder */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-surface-800">Solicitações recentes</h2>
          <button onClick={() => navigate('/cliente/solicitacoes')} className="text-sm text-primary-800 hover:underline">
            Ver todas
          </button>
        </div>
        <Card padding="none">
          <EmptyState
            title="Nenhuma solicitação ainda"
            description="Crie sua primeira solicitação e receba orçamentos de prestadores aprovados."
            action={
              <Button onClick={() => navigate('/cliente/solicitar')} icon={<PlusCircle className="w-4 h-4" />}>
                Criar solicitação
              </Button>
            }
          />
        </Card>
      </div>
    </div>
  );
}
