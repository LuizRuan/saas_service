import { adminService } from './admin.service';
import { quoteService } from './quote.service';
import { orderService } from './order.service';
import { paymentService } from './payment.service';
import { serviceRequestService } from './serviceRequest.service';
import type { AppNotification } from '@/types/notification';
import type { UserRole } from '@/types';

function idOf(val: string | { _id?: string; [k: string]: unknown } | undefined): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val._id ?? '';
}

function isWithinHours(dateStr: string | undefined, hours: number): boolean {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < hours * 3600 * 1000;
}

async function buildAdminNotifications(): Promise<AppNotification[]> {
  const results = await Promise.allSettled([
    adminService.getProviders(20),
    adminService.getDisputes(20),
    adminService.getOrders(20),
    adminService.getServiceRequests(20),
    adminService.getPayments(20),
  ]);

  const [providersRes, disputesRes, ordersRes, requestsRes, paymentsRes] = results;
  const notifications: AppNotification[] = [];

  if (providersRes.status === 'fulfilled') {
    providersRes.value.providers
      .filter(p => p.status === 'pending')
      .forEach(p => {
        notifications.push({
          id: `provider_pending_${p._id}`,
          type: 'provider_pending',
          title: 'Prestador aguardando aprovação',
          description: `${p.professionalName} precisa ser aprovado para começar a receber pedidos.`,
          date: p.createdAt,
          href: '/admin/prestadores',
          priority: 'high',
        });
      });
  }

  if (disputesRes.status === 'fulfilled') {
    disputesRes.value.disputes
      .filter(d => d.status === 'open' || d.status === 'under_review')
      .forEach(d => {
        notifications.push({
          id: `dispute_${d._id}`,
          type: 'dispute',
          title: 'Disputa precisa de análise',
          description: d.reason ? `Motivo: ${d.reason}` : 'Disputa aberta aguardando resolução.',
          date: d.createdAt,
          href: '/admin/disputas',
          priority: 'high',
        });
      });
  }

  if (ordersRes.status === 'fulfilled') {
    ordersRes.value.orders
      .filter(o => o.status === 'waiting_approval')
      .forEach(o => {
        notifications.push({
          id: `order_action_${o._id}`,
          type: 'order_action',
          title: 'Ordem aguardando aprovação do cliente',
          description: `Cliente: ${(o.clientId as { name?: string })?.name ?? 'N/D'}`,
          date: o.createdAt,
          href: '/admin/ordens',
          priority: 'medium',
        });
      });
  }

  if (requestsRes.status === 'fulfilled') {
    requestsRes.value.requests
      .filter(r => isWithinHours(r.createdAt, 48))
      .forEach(r => {
        notifications.push({
          id: `new_request_${r._id}`,
          type: 'new_request',
          title: 'Nova solicitação criada',
          description: `${r.description.slice(0, 80)}${r.description.length > 80 ? '…' : ''}`,
          date: r.createdAt,
          href: '/admin/solicitacoes',
          priority: 'low',
        });
      });
  }

  if (paymentsRes.status === 'fulfilled') {
    paymentsRes.value.payments
      .filter(p => p.status === 'pending')
      .forEach(p => {
        notifications.push({
          id: `payment_${p._id}`,
          type: 'payment',
          title: 'Pagamento pendente',
          description: `Valor: R$ ${p.amount.toFixed(2)} — tipo: ${p.type}`,
          date: p.createdAt,
          href: '/admin/pagamentos',
          priority: 'medium',
        });
      });
  }

  return notifications;
}

async function buildClientNotifications(): Promise<AppNotification[]> {
  const results = await Promise.allSettled([
    quoteService.getMy(),
    orderService.getMy(),
    paymentService.getMy(),
  ]);

  const [quotesRes, ordersRes, paymentsRes] = results;
  const notifications: AppNotification[] = [];

  if (quotesRes.status === 'fulfilled') {
    quotesRes.value.items
      .filter(q => q.status === 'sent')
      .forEach(q => {
        const reqId = idOf(q.serviceRequestId as string | { _id?: string });
        notifications.push({
          id: `quote_received_${q._id}`,
          type: 'quote_received',
          title: 'Novo orçamento recebido',
          description: `Valor: R$ ${q.totalAmount.toFixed(2)}${q.estimatedTime ? ` · Prazo: ${q.estimatedTime}` : ''}`,
          date: q.createdAt,
          href: reqId ? `/cliente/solicitacoes/${reqId}` : '/cliente/solicitacoes',
          priority: 'high',
        });
      });
  }

  if (ordersRes.status === 'fulfilled') {
    ordersRes.value.items.forEach(o => {
      const href = `/cliente/ordens/${o._id}`;
      if (o.status === 'created') {
        notifications.push({
          id: `order_created_${o._id}`,
          type: 'order_created',
          title: 'Sua ordem foi criada',
          description: 'O prestador foi notificado. Aguarde o agendamento.',
          date: o.createdAt,
          href,
          priority: 'medium',
        });
      } else if (o.status === 'waiting_approval') {
        notifications.push({
          id: `order_action_${o._id}`,
          type: 'order_action',
          title: 'Serviço aguardando sua aprovação',
          description: 'O prestador marcou o serviço como concluído. Confirme para liberar o pagamento.',
          date: o.updatedAt,
          href,
          priority: 'high',
        });
      } else if (o.status === 'completed' && isWithinHours(o.updatedAt, 168)) {
        notifications.push({
          id: `order_completed_${o._id}`,
          type: 'order_completed',
          title: 'Serviço concluído',
          description: 'Tudo certo! Considere deixar uma avaliação.',
          date: o.updatedAt,
          href,
          priority: 'low',
        });
      }
    });
  }

  if (paymentsRes.status === 'fulfilled') {
    paymentsRes.value
      .filter(p => p.status === 'pending')
      .forEach(p => {
        const orderId = idOf(p.orderId as string | { _id?: string });
        notifications.push({
          id: `payment_${p._id}`,
          type: 'payment',
          title: p.type === 'deposit' ? 'Pague o sinal para agendar' : 'Pagamento restante disponível',
          description: `Valor: R$ ${p.amount.toFixed(2)} (simulado)`,
          date: p.createdAt,
          href: orderId ? `/cliente/ordens/${orderId}` : '/cliente/ordens',
          priority: 'high',
        });
      });
  }

  return notifications;
}

async function buildProviderNotifications(): Promise<AppNotification[]> {
  const results = await Promise.allSettled([
    serviceRequestService.getAvailable(),
    quoteService.getMy(),
    orderService.getMy(),
    paymentService.getMy(),
  ]);

  const [availableRes, quotesRes, ordersRes, paymentsRes] = results;
  const notifications: AppNotification[] = [];

  if (availableRes.status === 'fulfilled' && availableRes.value.items.length > 0) {
    const count = availableRes.value.items.length;
    notifications.push({
      id: 'available_requests',
      type: 'new_request',
      title: `${count} pedido${count > 1 ? 's' : ''} disponível${count > 1 ? 'is' : ''} na sua região`,
      description: 'Veja os pedidos abertos e envie seu orçamento.',
      href: '/prestador/pedidos',
      priority: 'high',
    });
  }

  if (quotesRes.status === 'fulfilled') {
    quotesRes.value.items
      .filter(q => q.status === 'accepted')
      .forEach(q => {
        const reqId = idOf(q.serviceRequestId as string | { _id?: string });
        notifications.push({
          id: `quote_accepted_${q._id}`,
          type: 'quote_accepted',
          title: 'Seu orçamento foi aceito',
          description: `Valor: R$ ${q.totalAmount.toFixed(2)} — aguarde o pagamento do sinal.`,
          date: q.createdAt,
          href: reqId ? `/prestador/pedidos/${reqId}` : '/prestador/orcamentos',
          priority: 'high',
        });
      });
  }

  if (ordersRes.status === 'fulfilled') {
    ordersRes.value.items.forEach(o => {
      const href = `/prestador/ordens/${o._id}`;
      if (o.status === 'scheduled') {
        notifications.push({
          id: `order_scheduled_${o._id}`,
          type: 'order_action',
          title: 'Ordem agendada — pronto para iniciar',
          description: 'O cliente pagou o sinal. Você já pode iniciar o serviço.',
          date: o.updatedAt,
          href,
          priority: 'medium',
        });
      } else if (o.status === 'in_progress') {
        notifications.push({
          id: `order_inprogress_${o._id}`,
          type: 'order_action',
          title: 'Ordem em andamento',
          description: 'Lembre-se de marcar como concluída quando terminar.',
          date: o.updatedAt,
          href,
          priority: 'low',
        });
      } else if (o.status === 'waiting_approval') {
        notifications.push({
          id: `order_waitapproval_${o._id}`,
          type: 'order_action',
          title: 'Aguardando aprovação do cliente',
          description: 'O cliente precisa confirmar a conclusão do serviço.',
          date: o.updatedAt,
          href,
          priority: 'medium',
        });
      }
    });
  }

  if (paymentsRes.status === 'fulfilled') {
    paymentsRes.value
      .filter(p => p.status === 'paid' && p.type === 'deposit')
      .forEach(p => {
        const orderId = idOf(p.orderId as string | { _id?: string });
        notifications.push({
          id: `payment_deposit_${p._id}`,
          type: 'payment',
          title: 'Cliente pagou o sinal',
          description: `Valor recebido: R$ ${p.providerAmount.toFixed(2)}. Você já pode iniciar.`,
          date: p.createdAt,
          href: orderId ? `/prestador/ordens/${orderId}` : '/prestador/ordens',
          priority: 'high',
        });
      });
  }

  return notifications;
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export async function buildNotifications(role: UserRole): Promise<AppNotification[]> {
  let notifications: AppNotification[] = [];

  if (role === 'admin') {
    notifications = await buildAdminNotifications();
  } else if (role === 'client') {
    notifications = await buildClientNotifications();
  } else if (role === 'provider') {
    notifications = await buildProviderNotifications();
  }

  return notifications.sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
    return 0;
  });
}
