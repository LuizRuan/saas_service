export const serviceRequestStatusLabels: Record<string, string> = {
  open: 'Aberto',
  quoted: 'Orçamento recebido',
  scheduled: 'Agendado',
  in_progress: 'Em andamento',
  waiting_approval: 'Aguardando aprovação',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  dispute: 'Em disputa',
};

export const orderStatusLabels: Record<string, string> = {
  pending_payment: 'Aguardando pagamento',
  scheduled: 'Agendado',
  in_progress: 'Em andamento',
  waiting_approval: 'Aguardando aprovação',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  dispute: 'Em disputa',
};

export const quoteStatusLabels: Record<string, string> = {
  sent: 'Enviado',
  accepted: 'Aceito',
  rejected: 'Recusado',
  expired: 'Expirado',
};

export const paymentStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  refunded: 'Reembolsado',
  failed: 'Falhou',
};

export const providerStatusLabels: Record<string, string> = {
  pending: 'Aguardando aprovação',
  approved: 'Aprovado',
  blocked: 'Bloqueado',
};

export const urgencyLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

export const roleLabels: Record<string, string> = {
  client: 'Cliente',
  provider: 'Prestador',
  admin: 'Administrador',
};
