import { useNavigate } from 'react-router-dom';
import { FileText, DollarSign, ClipboardList, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // In Etapa 4, providerProfile will come from context
  const isPending = true; // placeholder until providerProfile is loaded

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-800">
          Olá, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-surface-600 mt-1">Painel do prestador</p>
      </div>

      {isPending && (
        <Alert variant="warning" title="Conta em análise">
          Seu perfil está sendo avaliado pela nossa equipe. Você será notificado quando for aprovado e
          poderá começar a receber pedidos.
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pedidos disponíveis', desc: 'Veja pedidos na sua área', icon: <FileText className="w-6 h-6 text-primary-800" />, to: '/prestador/pedidos' },
          { label: 'Meus orçamentos', desc: 'Acompanhe suas propostas', icon: <DollarSign className="w-6 h-6 text-surface-600" />, to: '/prestador/orcamentos' },
          { label: 'Ordens de serviço', desc: 'Serviços em andamento', icon: <ClipboardList className="w-6 h-6 text-surface-600" />, to: '/prestador/ordens' },
        ].map((item) => (
          <Card key={item.label} hover padding="md" onClick={() => navigate(item.to)}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-surface-100">{item.icon}</div>
              <div className="flex-1">
                <p className="font-semibold text-surface-800 text-sm">{item.label}</p>
                <p className="text-xs text-surface-600 mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-surface-300 mt-0.5" />
            </div>
          </Card>
        ))}
      </div>

      <Card padding="md">
        <div className="flex items-center gap-3 text-surface-600">
          <AlertCircle className="w-5 h-5 text-primary-800 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-surface-800">Complete seu perfil</p>
            <p className="text-xs text-surface-600 mt-0.5">
              Adicione suas especialidades, cidades de atendimento e foto profissional para atrair mais clientes.
            </p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto flex-shrink-0" onClick={() => navigate('/prestador/perfil')}>
            Editar perfil
          </Button>
        </div>
      </Card>
    </div>
  );
}
