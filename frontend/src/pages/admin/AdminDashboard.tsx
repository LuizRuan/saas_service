import { useNavigate } from 'react-router-dom';
import { Users, Wrench, FileText, ClipboardList, DollarSign, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';

const stats = [
  { label: 'Usuários', value: '—', icon: <Users className="w-5 h-5" />, to: '/admin/usuarios', color: 'text-blue-600 bg-blue-50' },
  { label: 'Prestadores', value: '—', icon: <Wrench className="w-5 h-5" />, to: '/admin/prestadores', color: 'text-purple-600 bg-purple-50' },
  { label: 'Solicitações', value: '—', icon: <FileText className="w-5 h-5" />, to: '/admin/solicitacoes', color: 'text-orange-600 bg-orange-50' },
  { label: 'Ordens', value: '—', icon: <ClipboardList className="w-5 h-5" />, to: '/admin/ordens', color: 'text-trust-600 bg-trust-50' },
  { label: 'Pagamentos', value: '—', icon: <DollarSign className="w-5 h-5" />, to: '/admin/pagamentos', color: 'text-primary-600 bg-primary-50' },
  { label: 'Disputas', value: '—', icon: <AlertTriangle className="w-5 h-5" />, to: '/admin/disputas', color: 'text-red-600 bg-red-50' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-800">Painel Administrativo</h1>
        <p className="text-surface-600 mt-1">Visão geral da plataforma MãoCerta</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} hover padding="md" onClick={() => navigate(s.to)}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-xs text-surface-600">{s.label}</p>
                <p className="text-xl font-bold text-surface-800">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="md">
        <p className="text-sm text-surface-600 text-center">
          Os dados do painel serão carregados após a implementação das rotas de admin (Etapa 4).
        </p>
      </Card>
    </div>
  );
}
