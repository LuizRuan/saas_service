import { Badge, type BadgeColor } from '@/components/ui/Badge';

type StatusKey =
  | 'open' | 'quoted' | 'scheduled' | 'in_progress' | 'waiting_approval'
  | 'completed' | 'cancelled' | 'dispute'
  | 'sent' | 'accepted' | 'rejected' | 'expired'
  | 'created' | 'pending' | 'paid' | 'refunded' | 'failed';

const STATUS_CONFIG: Record<StatusKey, { color: BadgeColor; label: string; dot?: string }> = {
  // ServiceRequest
  open:             { color: 'blue',   label: 'Aberta',           dot: 'bg-blue-500' },
  quoted:           { color: 'yellow', label: 'Com Orçamentos',   dot: 'bg-yellow-500' },
  scheduled:        { color: 'purple', label: 'Agendada',         dot: 'bg-purple-500' },
  in_progress:      { color: 'orange', label: 'Em Andamento',     dot: 'bg-orange-500' },
  waiting_approval: { color: 'yellow', label: 'Aguard. Aprovação', dot: 'bg-yellow-500' },
  completed:        { color: 'green',  label: 'Concluída',        dot: 'bg-green-500' },
  cancelled:        { color: 'gray',   label: 'Cancelada',        dot: 'bg-slate-400' },
  dispute:          { color: 'red',    label: 'Em Disputa',       dot: 'bg-red-500' },
  // Quote
  sent:     { color: 'blue',   label: 'Enviado',    dot: 'bg-blue-500' },
  accepted: { color: 'green',  label: 'Aceito',     dot: 'bg-green-500' },
  rejected: { color: 'red',    label: 'Recusado',   dot: 'bg-red-500' },
  expired:  { color: 'gray',   label: 'Expirado',   dot: 'bg-slate-400' },
  // Order
  created:  { color: 'blue',   label: 'Criada',     dot: 'bg-blue-500' },
  // Payment
  pending:  { color: 'yellow', label: 'Pendente',    dot: 'bg-yellow-500' },
  paid:     { color: 'green',  label: 'Pago',        dot: 'bg-green-500' },
  refunded: { color: 'purple', label: 'Reembolsado', dot: 'bg-purple-500' },
  failed:   { color: 'red',    label: 'Falhou',      dot: 'bg-red-500' },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as StatusKey] ?? { color: 'gray' as BadgeColor, label: status, dot: 'bg-slate-400' };
  return (
    <Badge color={config.color}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${config.dot ?? 'bg-slate-400'}`} />
      {config.label}
    </Badge>
  );
}
