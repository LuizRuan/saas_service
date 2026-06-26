# Etapa 3C-A — Ordens e Pagamento Simulado: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activate client and provider order flows with simulated deposit (20%) and remaining (80%) payments — frontend only, zero backend changes.

**Architecture:** Seven new/modified files in `frontend/src` implement the full flow: payment service, two order service methods, a navigation fix, four new pages, plus route and nav wiring. Each action button reloads its page data in-place (no redirect).

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, Axios (via `@/lib/axios`)

## Global Constraints

- **Backend: zero changes.** All endpoints already exist and are 100% functional.
- **No commits during implementation.** User commits manually after all tasks are complete.
- **TypeScript:** always `import type { ReactNode } from 'react'` — never `React.ReactNode`.
- **Tailwind opacity:** only standard steps (`/5`, `/10`, `/15`, `/20`, `/25`, `/30`, `/40`, `/50`…). Never `/3` or `/8` — use `/[0.03]` and `/[0.08]` instead.
- **API envelope:** responses unwrap from `res.data.data` (standard `ApiResponse<T>` pattern).
- **Dark glassmorphism UI:** same visual pattern as existing admin/dashboard pages.
- **Reload after actions:** after any action button call succeeds, reload page data in-place by incrementing a state counter — never redirect.
- **orderId normalization:** use `getPaymentOrderId` helper wherever a payment's `orderId` must be compared to a plain string (see Task 3 for definition).
- **No avaliações, no PDF, no upload UI, no real gateways, no backend changes.**
- **`fadeUp` from `@/lib/animations`, `formatCurrency`/`formatDate`/`formatDateTime` from `@/lib/utils`.**
- **`api` from `@/lib/axios` (not raw axios).**

---

## File Map

| File | Action |
|------|--------|
| `frontend/src/services/payment.service.ts` | **Create** — Payment interface + 3 methods |
| `frontend/src/services/order.service.ts` | **Modify** — add `updateStatus` + `approveCompletion` |
| `frontend/src/pages/client/MyOrdersPage.tsx` | **Modify** — fix navigation link only (one line) |
| `frontend/src/pages/client/OrderDetailPage.tsx` | **Create** — client order detail with action buttons |
| `frontend/src/pages/client/ClientPaymentsPage.tsx` | **Create** — client payments list |
| `frontend/src/pages/provider/ProviderOrdersPage.tsx` | **Create** — provider orders list |
| `frontend/src/pages/provider/ProviderOrderDetailPage.tsx` | **Create** — provider order detail with action buttons |
| `frontend/src/App.tsx` | **Modify** — add 4 imports + 4 routes |
| `frontend/src/components/layout/DashboardLayout.tsx` | **Modify** — remove `disabled` from 2 nav items |

---

### Task 1: Services Layer

**Files:**
- Create: `frontend/src/services/payment.service.ts`
- Modify: `frontend/src/services/order.service.ts`

**Interfaces:**
- Produces: `Payment` interface (exported from payment.service.ts), `paymentService.simulateDeposit`, `paymentService.simulateRemaining`, `paymentService.getMy`, `orderService.updateStatus`, `orderService.approveCompletion`

- [ ] **Step 1: Create `frontend/src/services/payment.service.ts`**

```typescript
import api from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface Payment {
  _id: string;
  orderId?: string | { _id?: string; status?: string };
  clientId?: string | { name: string; email: string };
  providerId?: string | { name: string; email: string };
  type: 'deposit' | 'remaining' | 'full';
  amount: number;
  platformFee: number;
  providerAmount: number;
  gateway: 'simulated' | 'mercado_pago' | 'asaas' | 'pagarme';
  externalPaymentId?: string;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  createdAt: string;
}

async function simulateDeposit(orderId: string): Promise<Payment> {
  const res = await api.post<ApiResponse<Payment>>(`/payments/${orderId}/deposit/simulate`);
  return res.data.data;
}

async function simulateRemaining(orderId: string): Promise<Payment> {
  const res = await api.post<ApiResponse<Payment>>(`/payments/${orderId}/remaining/simulate`);
  return res.data.data;
}

async function getMy(): Promise<Payment[]> {
  const res = await api.get<ApiResponse<Payment[]>>('/payments/my');
  return res.data.data;
}

export const paymentService = { simulateDeposit, simulateRemaining, getMy };
```

- [ ] **Step 2: Add `updateStatus` and `approveCompletion` to `frontend/src/services/order.service.ts`**

Replace the entire file with:

```typescript
import api from '@/lib/axios';
import type { ApiResponse, Order } from '@/types';

export const orderService = {
  async getMy(): Promise<Order[]> {
    const res = await api.get<ApiResponse<Order[]>>('/orders/my');
    return res.data.data;
  },

  async getById(id: string): Promise<Order> {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },

  async updateStatus(id: string, status: string): Promise<Order> {
    const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return res.data.data;
  },

  async approveCompletion(id: string): Promise<Order> {
    const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/approve-completion`);
    return res.data.data;
  },
};
```

- [ ] **Step 3: Verify TypeScript — run `cd frontend && npm run typecheck`**

Expected: zero errors. If errors appear, fix before continuing.

---

### Task 2: MyOrdersPage Navigation Fix

**Files:**
- Modify: `frontend/src/pages/client/MyOrdersPage.tsx` (one line change)

**Interfaces:**
- Consumes: existing `orderService.getMy()`, existing `Order` type

- [ ] **Step 1: Fix the navigation link in MyOrdersPage**

In `frontend/src/pages/client/MyOrdersPage.tsx`, find line 128 (the `<Link to=...>` inside the orders list). Change:

```tsx
to={`/cliente/solicitacoes/${typeof order.serviceRequestId === 'object' ? (order.serviceRequestId as any)?._id : order.serviceRequestId}`}
```

To:

```tsx
to={`/cliente/ordens/${order._id}`}
```

The surrounding `<Link>` tag and all other content stays exactly as-is.

- [ ] **Step 2: Verify TypeScript — run `cd frontend && npm run typecheck`**

Expected: zero errors.

---

### Task 3: OrderDetailPage (Client)

**Files:**
- Create: `frontend/src/pages/client/OrderDetailPage.tsx`

**Interfaces:**
- Consumes: `orderService.getById(id: string): Promise<Order>` (from order.service.ts), `paymentService.getMy(): Promise<Payment[]>` (from payment.service.ts), `paymentService.simulateDeposit(orderId: string): Promise<Payment>`, `paymentService.simulateRemaining(orderId: string): Promise<Payment>`, `orderService.approveCompletion(id: string): Promise<Order>`
- `Payment` from `@/services/payment.service`
- `Order`, `OrderStatus` from `@/types`
- `fadeUp` from `@/lib/animations`
- `formatCurrency`, `formatDate`, `formatDateTime` from `@/lib/utils`

- [ ] **Step 1: Create `frontend/src/pages/client/OrderDetailPage.tsx`**

```tsx
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, ArrowLeft, AlertCircle, CreditCard,
  CheckCircle2, Clock, MapPin, Calendar, Loader2,
} from 'lucide-react';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import type { Payment } from '@/services/payment.service';
import { fadeUp } from '@/lib/animations';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const ORDER_STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  created:          { label: 'Aguardando sinal',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  scheduled:        { label: 'Agendada',            cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  in_progress:      { label: 'Em andamento',        cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  waiting_approval: { label: 'Aguard. aprovação',   cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  completed:        { label: 'Concluída',            cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelada',            cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

function getPaymentOrderId(orderId: Payment['orderId']): string {
  if (!orderId) return '';
  if (typeof orderId === 'object') return orderId._id ?? '';
  return orderId;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    Promise.all([orderService.getById(id), paymentService.getMy()])
      .then(([orderData, paymentsData]) => {
        setOrder(orderData);
        setPayments(paymentsData);
      })
      .catch(() => setError('Não foi possível carregar os detalhes da ordem.'))
      .finally(() => setLoading(false));
  }, [id, reloadKey]);

  const reload = () => setReloadKey(n => n + 1);

  const orderPayments = payments.filter(p => getPaymentOrderId(p.orderId) === id);
  const hasDeposit = orderPayments.some(p => p.type === 'deposit' && p.status === 'paid');
  const hasRemaining = orderPayments.some(p => p.type === 'remaining' && p.status === 'paid');

  const handleSimulateDeposit = async () => {
    if (!id) return;
    setActionLoading('deposit');
    setActionError('');
    try {
      await paymentService.simulateDeposit(id);
      reload();
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? '';
      setActionError(msg.toLowerCase().includes('already') ? 'Pagamento já realizado.' : 'Não foi possível processar o pagamento de sinal.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveCompletion = async () => {
    if (!id) return;
    setActionLoading('approve');
    setActionError('');
    try {
      await orderService.approveCompletion(id);
      reload();
    } catch (err: any) {
      setActionError('Não foi possível aprovar a conclusão.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSimulateRemaining = async () => {
    if (!id) return;
    setActionLoading('remaining');
    setActionError('');
    try {
      await paymentService.simulateRemaining(id);
      reload();
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? '';
      setActionError(msg.toLowerCase().includes('already') ? 'Pagamento já realizado.' : 'Não foi possível processar o pagamento restante.');
    } finally {
      setActionLoading(null);
    }
  };

  const statusCfg = order ? (ORDER_STATUS[order.status] ?? ORDER_STATUS.created) : null;
  const quote = order && typeof order.quoteId === 'object' ? order.quoteId : null;
  const sr = order && typeof order.serviceRequestId === 'object' ? order.serviceRequestId : null;
  const provider = order && typeof order.providerId === 'object' ? order.providerId : null;
  const depositAmount = quote?.depositAmount ?? order?.depositAmount ?? 0;
  const remainingAmount = quote?.remainingAmount ?? order?.remainingAmount ?? 0;
  const totalAmount = quote?.totalAmount ?? order?.totalAmount ?? 0;

  return (
    <div className="relative max-w-3xl mx-auto space-y-6">
      <div className="orb w-72 h-72 bg-blue-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      {/* Back */}
      <motion.div {...fadeUp(0)}>
        <Link to="/cliente/ordens" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Minhas Ordens
        </Link>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-6 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
              <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <motion.div {...fadeUp(0)} className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={reload} className="text-xs text-red-400/70 hover:text-red-300 mt-1 transition-colors">
              Tentar novamente
            </button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {!loading && !error && order && (
        <>
          {/* Header */}
          <motion.div {...fadeUp(0)} className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/20">
                <ClipboardList className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">#{order._id.slice(-6).toUpperCase()}</h1>
                <p className="text-xs text-white/35 mt-0.5">{formatDateTime(order.createdAt)}</p>
              </div>
            </div>
            {statusCfg && (
              <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border ${statusCfg.cls} shrink-0`}>
                {statusCfg.label}
              </span>
            )}
          </motion.div>

          {/* Simulated payment warning */}
          <motion.div {...fadeUp(0.05)} className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300">Este pagamento é simulado e não representa uma transação financeira real.</p>
          </motion.div>

          {/* Action error */}
          {actionError && (
            <motion.div {...fadeUp(0)} className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{actionError}</p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div {...fadeUp(0.1)} className="flex flex-wrap gap-3">
            {order.status === 'created' && !hasDeposit && (
              <button
                onClick={handleSimulateDeposit}
                disabled={actionLoading === 'deposit'}
                className="flex items-center gap-2 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-400 text-sm font-semibold px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'deposit' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Pagar sinal simulado — {formatCurrency(depositAmount)}
              </button>
            )}
            {order.status === 'waiting_approval' && (
              <button
                onClick={handleApproveCompletion}
                disabled={actionLoading === 'approve'}
                className="flex items-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 text-sm font-semibold px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Aprovar conclusão
              </button>
            )}
            {order.status === 'completed' && hasDeposit && !hasRemaining && (
              <button
                onClick={handleSimulateRemaining}
                disabled={actionLoading === 'remaining'}
                className="flex items-center gap-2 rounded-xl bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 text-violet-400 text-sm font-semibold px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'remaining' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Pagar restante simulado — {formatCurrency(remainingAmount)}
              </button>
            )}
          </motion.div>

          {/* Service info */}
          {sr && (
            <motion.div {...fadeUp(0.15)} className="rounded-2xl border border-white/5 p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Serviço</p>
              <InfoRow label="Descrição" value={(sr as any).description ?? '—'} />
              {(sr as any).city && (
                <InfoRow label="Cidade">
                  <span className="flex items-center gap-1 text-sm text-white/80">
                    <MapPin className="h-3.5 w-3.5 text-white/40" />{(sr as any).city}
                  </span>
                </InfoRow>
              )}
              {(sr as any).approximateAddress && <InfoRow label="Endereço" value={(sr as any).approximateAddress} />}
              {(sr as any).urgency && <InfoRow label="Urgência" value={(sr as any).urgency} />}
            </motion.div>
          )}

          {/* Quote info */}
          {quote && (
            <motion.div {...fadeUp(0.2)} className="rounded-2xl border border-white/5 p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Orçamento</p>
              <InfoRow label="Total" value={formatCurrency(totalAmount)} />
              <InfoRow label="Sinal (20%)" value={formatCurrency(depositAmount)} />
              <InfoRow label="Restante (80%)" value={formatCurrency(remainingAmount)} />
              {quote.estimatedTime && <InfoRow label="Prazo estimado" value={quote.estimatedTime} />}
              {quote.warrantyDays != null && <InfoRow label="Garantia" value={`${quote.warrantyDays} dias`} />}
              {quote.description && <InfoRow label="Descrição" value={quote.description} />}
            </motion.div>
          )}

          {/* Provider info */}
          {provider && (
            <motion.div {...fadeUp(0.25)} className="rounded-2xl border border-white/5 p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Prestador</p>
              <InfoRow label="Nome" value={(provider as any).name ?? '—'} />
              {(provider as any).phone && <InfoRow label="Telefone" value={(provider as any).phone} />}
            </motion.div>
          )}

          {/* Dates */}
          <motion.div {...fadeUp(0.3)} className="rounded-2xl border border-white/5 p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Linha do tempo</p>
            <InfoRow label="Criada em" value={formatDateTime(order.createdAt)}>
              <span className="flex items-center gap-1 text-sm text-white/80">
                <Calendar className="h-3.5 w-3.5 text-white/40" />{formatDateTime(order.createdAt)}
              </span>
            </InfoRow>
            {order.scheduledDate && (
              <InfoRow label="Agendada para">
                <span className="flex items-center gap-1 text-sm text-white/80">
                  <Clock className="h-3.5 w-3.5 text-white/40" />{formatDate(order.scheduledDate)}
                </span>
              </InfoRow>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}

interface InfoRowProps { label: string; value?: string; children?: ReactNode }

function InfoRow({ label, value, children }: InfoRowProps) {
  if (!value && !children) return null;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
      <p className="text-white/35 w-32 shrink-0 text-xs pt-0.5">{label}</p>
      <div className="flex-1 min-w-0">
        {children ?? <p className="text-white/80 text-sm break-words">{value}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript — run `cd frontend && npm run typecheck`**

Expected: zero errors.

---

### Task 4: ClientPaymentsPage

**Files:**
- Create: `frontend/src/pages/client/ClientPaymentsPage.tsx`

**Interfaces:**
- Consumes: `paymentService.getMy(): Promise<Payment[]>`, `Payment` from `@/services/payment.service`

- [ ] **Step 1: Create `frontend/src/pages/client/ClientPaymentsPage.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, ArrowRight } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import type { Payment } from '@/services/payment.service';
import { fadeUp } from '@/lib/animations';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const TYPE_CONFIG: Record<string, { label: string; cls: string }> = {
  deposit:   { label: 'Sinal',    cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  remaining: { label: 'Restante', cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  full:      { label: 'Total',    cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Pendente',    cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  paid:     { label: 'Pago',        cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  refunded: { label: 'Reembolsado', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  failed:   { label: 'Falhou',      cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

function getPaymentOrderId(orderId: Payment['orderId']): string {
  if (!orderId) return '';
  if (typeof orderId === 'object') return orderId._id ?? '';
  return orderId;
}

export function ClientPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    paymentService.getMy()
      .then(setPayments)
      .catch(() => setError('Não foi possível carregar seus pagamentos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative max-w-4xl mx-auto space-y-6">
      <div className="orb w-72 h-72 bg-green-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/15 border border-green-500/20">
            <CreditCard className="h-3.5 w-3.5 text-green-400" />
          </div>
          <span className="text-xs font-semibold text-green-400/80 uppercase tracking-widest">Financeiro</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Meus <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">Pagamentos</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Histórico de pagamentos simulados realizados.</p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 shrink-0">
            MVP Simulado
          </span>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-2.5 bg-white/5 rounded w-1/3" />
                </div>
                <div className="h-5 w-16 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && payments.length === 0 && (
        <motion.div {...fadeUp(0)} className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
            <CreditCard className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="font-semibold text-white/60 mb-1">Nenhum pagamento realizado ainda.</h3>
          <p className="text-sm text-white/30 max-w-xs mb-5">
            Quando você pagar o sinal ou restante de uma ordem, os registros aparecerão aqui.
          </p>
          <Link
            to="/cliente/ordens"
            className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Ver minhas ordens <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}

      {/* List */}
      {!loading && !error && payments.length > 0 && (
        <motion.div {...fadeUp(0.05)} className="space-y-2">
          <p className="text-xs text-white/30 mb-3">{payments.length} pagamento{payments.length !== 1 ? 's' : ''}</p>
          {payments.map((p, i) => {
            const orderId = getPaymentOrderId(p.orderId);
            const typeCfg = TYPE_CONFIG[p.type];
            const statusCfg = STATUS_CONFIG[p.status];
            return (
              <motion.div key={p._id} {...fadeUp(0.05 + i * 0.01)}>
                {orderId ? (
                  <Link
                    to={`/cliente/ordens/${orderId}`}
                    className="flex items-center gap-4 rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <PaymentCardContent p={p} typeCfg={typeCfg} statusCfg={statusCfg} />
                  </Link>
                ) : (
                  <div
                    className="flex items-center gap-4 rounded-2xl border border-white/5 p-4"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <PaymentCardContent p={p} typeCfg={typeCfg} statusCfg={statusCfg} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

interface CfgItem { label: string; cls: string }

function PaymentCardContent({ p, typeCfg, statusCfg }: { p: Payment; typeCfg?: CfgItem; statusCfg?: CfgItem }) {
  return (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 border border-white/5">
        <CreditCard className="h-5 w-5 text-white/50" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">#{p._id.slice(-6).toUpperCase()}</p>
        <p className="text-xs text-white/35">{formatDateTime(p.createdAt)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        <span className="text-sm font-bold text-white">{formatCurrency(p.amount)}</span>
        {typeCfg && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeCfg.cls}`}>{typeCfg.label}</span>
        )}
        {statusCfg && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.cls}`}>{statusCfg.label}</span>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript — run `cd frontend && npm run typecheck`**

Expected: zero errors.

---

### Task 5: ProviderOrdersPage

**Files:**
- Create: `frontend/src/pages/provider/ProviderOrdersPage.tsx`

**Interfaces:**
- Consumes: `orderService.getMy(): Promise<Order[]>`, `Order`, `OrderStatus` from `@/types`

- [ ] **Step 1: Create `frontend/src/pages/provider/ProviderOrdersPage.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, AlertCircle, ArrowRight,
  Calendar, CheckCircle2, Clock, Package, XCircle,
} from 'lucide-react';
import { orderService } from '@/services/order.service';
import { fadeUp } from '@/lib/animations';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> = {
  created:          { label: 'Aguardando sinal',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  scheduled:        { label: 'Agendada',            cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  in_progress:      { label: 'Em andamento',        cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  waiting_approval: { label: 'Aguard. aprovação',   cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  completed:        { label: 'Concluída',            cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelada',            cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

export function ProviderOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService.getMy()
      .then(setOrders)
      .catch(() => setError('Não foi possível carregar suas ordens.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative max-w-4xl mx-auto space-y-6">
      <div className="orb w-72 h-72 bg-orange-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/15 border border-orange-500/20">
            <ClipboardList className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <span className="text-xs font-semibold text-orange-400/80 uppercase tracking-widest">Trabalhos</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Minhas <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-300">Ordens</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Serviços aceitos e em andamento.</p>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-5 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="h-4 bg-white/5 rounded-lg w-1/3 mb-3" />
              <div className="h-3 bg-white/5 rounded-lg w-2/3 mb-2" />
              <div className="h-3 bg-white/5 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <motion.div {...fadeUp(0)} className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
            <ClipboardList className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="font-semibold text-white/60 mb-1">Nenhuma ordem ainda</h3>
          <p className="text-sm text-white/30 max-w-xs mb-5">
            Quando um cliente aceitar seu orçamento, a ordem de serviço aparecerá aqui.
          </p>
          <Link
            to="/prestador/pedidos"
            className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Ver pedidos disponíveis <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}

      {/* List */}
      {!loading && !error && orders.length > 0 && (
        <motion.div {...fadeUp(0.05)} className="space-y-3">
          {orders.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.created;
            const client = typeof order.clientId === 'object' ? order.clientId : null;
            const quote = typeof order.quoteId === 'object' ? order.quoteId : null;
            const totalAmount = quote?.totalAmount ?? order.totalAmount ?? 0;
            return (
              <motion.div key={order._id} {...fadeUp(0.05 + i * 0.01)}>
                <Link
                  to={`/prestador/ordens/${order._id}`}
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-white/5 p-5 hover:border-white/15 hover:-translate-y-0.5 transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white group-hover:text-orange-300 transition-colors">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {client && (
                      <p className="text-xs text-white/40">Cliente: {(client as any).name ?? '—'}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-white/35">
                        <Calendar className="h-3 w-3" />{formatDate(order.createdAt)}
                      </div>
                      {order.scheduledDate && (
                        <div className="flex items-center gap-1.5 text-xs text-white/35">
                          <Clock className="h-3 w-3" />Agend.: {formatDate(order.scheduledDate)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">{formatCurrency(totalAmount)}</p>
                    <p className="text-xs text-white/30 mt-0.5">Ver detalhes →</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript — run `cd frontend && npm run typecheck`**

Expected: zero errors.

---

### Task 6: ProviderOrderDetailPage

**Files:**
- Create: `frontend/src/pages/provider/ProviderOrderDetailPage.tsx`

**Interfaces:**
- Consumes: `orderService.getById(id: string): Promise<Order>`, `orderService.updateStatus(id: string, status: string): Promise<Order>`, `Order`, `OrderStatus` from `@/types`

- [ ] **Step 1: Create `frontend/src/pages/provider/ProviderOrderDetailPage.tsx`**

```tsx
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, ArrowLeft, AlertCircle,
  Play, CheckCircle2, Loader2, Calendar, Clock, Info,
} from 'lucide-react';
import { orderService } from '@/services/order.service';
import { fadeUp } from '@/lib/animations';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const ORDER_STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  created:          { label: 'Aguardando sinal',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  scheduled:        { label: 'Agendada',            cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  in_progress:      { label: 'Em andamento',        cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  waiting_approval: { label: 'Aguard. aprovação',   cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  completed:        { label: 'Concluída',            cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelada',            cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

export function ProviderOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    orderService.getById(id)
      .then(setOrder)
      .catch(() => setError('Não foi possível carregar os detalhes da ordem.'))
      .finally(() => setLoading(false));
  }, [id, reloadKey]);

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    setActionLoading(status);
    setActionError('');
    try {
      await orderService.updateStatus(id, status);
      setReloadKey(n => n + 1);
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? '';
      if (msg.toLowerCase().includes('deposit')) {
        setActionError('O cliente ainda não pagou o sinal. Aguarde o pagamento para iniciar o serviço.');
      } else {
        setActionError('Não foi possível atualizar o status da ordem.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const statusCfg = order ? (ORDER_STATUS[order.status] ?? ORDER_STATUS.created) : null;
  const quote = order && typeof order.quoteId === 'object' ? order.quoteId : null;
  const sr = order && typeof order.serviceRequestId === 'object' ? order.serviceRequestId : null;
  const client = order && typeof order.clientId === 'object' ? order.clientId : null;
  const totalAmount = quote?.totalAmount ?? order?.totalAmount ?? 0;

  return (
    <div className="relative max-w-3xl mx-auto space-y-6">
      <div className="orb w-72 h-72 bg-orange-600 -top-20 -right-20 opacity-10 pointer-events-none" />

      {/* Back */}
      <motion.div {...fadeUp(0)}>
        <Link to="/prestador/ordens" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Minhas Ordens
        </Link>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-6 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
              <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <motion.div {...fadeUp(0)} className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={() => setReloadKey(n => n + 1)} className="text-xs text-red-400/70 hover:text-red-300 mt-1 transition-colors">
              Tentar novamente
            </button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {!loading && !error && order && (
        <>
          {/* Header */}
          <motion.div {...fadeUp(0)} className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/20">
                <ClipboardList className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">#{order._id.slice(-6).toUpperCase()}</h1>
                <p className="text-xs text-white/35 mt-0.5">{formatDateTime(order.createdAt)}</p>
              </div>
            </div>
            {statusCfg && (
              <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border ${statusCfg.cls} shrink-0`}>
                {statusCfg.label}
              </span>
            )}
          </motion.div>

          {/* Deposit paid info (when scheduled) */}
          {order.status === 'scheduled' && (
            <motion.div {...fadeUp(0.05)} className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
              <Info className="h-4 w-4 text-blue-400 shrink-0" />
              <p className="text-xs text-blue-300">O cliente pagou o sinal. Você pode iniciar o serviço.</p>
            </motion.div>
          )}

          {/* Action error */}
          {actionError && (
            <motion.div {...fadeUp(0)} className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{actionError}</p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div {...fadeUp(0.1)} className="flex flex-wrap gap-3">
            {order.status === 'scheduled' && (
              <button
                onClick={() => handleUpdateStatus('in_progress')}
                disabled={actionLoading === 'in_progress'}
                className="flex items-center gap-2 rounded-xl bg-orange-600/20 border border-orange-500/30 hover:bg-orange-600/30 text-orange-400 text-sm font-semibold px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'in_progress' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Iniciar serviço
              </button>
            )}
            {order.status === 'in_progress' && (
              <button
                onClick={() => handleUpdateStatus('waiting_approval')}
                disabled={actionLoading === 'waiting_approval'}
                className="flex items-center gap-2 rounded-xl bg-yellow-600/20 border border-yellow-500/30 hover:bg-yellow-600/30 text-yellow-400 text-sm font-semibold px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'waiting_approval' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Marcar como aguardando aprovação
              </button>
            )}
          </motion.div>

          {/* Client info */}
          {client && (
            <motion.div {...fadeUp(0.15)} className="rounded-2xl border border-white/5 p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Cliente</p>
              <InfoRow label="Nome" value={(client as any).name ?? '—'} />
              {(client as any).phone && <InfoRow label="Telefone" value={(client as any).phone} />}
            </motion.div>
          )}

          {/* Service info */}
          {sr && (
            <motion.div {...fadeUp(0.2)} className="rounded-2xl border border-white/5 p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Serviço</p>
              <InfoRow label="Descrição" value={(sr as any).description ?? '—'} />
              {(sr as any).city && <InfoRow label="Cidade" value={(sr as any).city} />}
              {(sr as any).approximateAddress && <InfoRow label="Endereço" value={(sr as any).approximateAddress} />}
              {(sr as any).urgency && <InfoRow label="Urgência" value={(sr as any).urgency} />}
            </motion.div>
          )}

          {/* Quote info */}
          {quote && (
            <motion.div {...fadeUp(0.25)} className="rounded-2xl border border-white/5 p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Orçamento</p>
              <InfoRow label="Valor total" value={formatCurrency(totalAmount)} />
              <InfoRow label="Sinal (20%)" value={formatCurrency(quote.depositAmount ?? 0)} />
              <InfoRow label="Restante (80%)" value={formatCurrency(quote.remainingAmount ?? 0)} />
              {quote.estimatedTime && <InfoRow label="Prazo estimado" value={quote.estimatedTime} />}
              {quote.warrantyDays != null && <InfoRow label="Garantia" value={`${quote.warrantyDays} dias`} />}
              {quote.description && <InfoRow label="Observações" value={quote.description} />}
            </motion.div>
          )}

          {/* Dates */}
          <motion.div {...fadeUp(0.3)} className="rounded-2xl border border-white/5 p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Linha do tempo</p>
            <InfoRow label="Criada em">
              <span className="flex items-center gap-1 text-sm text-white/80">
                <Calendar className="h-3.5 w-3.5 text-white/40" />{formatDateTime(order.createdAt)}
              </span>
            </InfoRow>
            {order.scheduledDate && (
              <InfoRow label="Agendada para">
                <span className="flex items-center gap-1 text-sm text-white/80">
                  <Clock className="h-3.5 w-3.5 text-white/40" />{formatDate(order.scheduledDate)}
                </span>
              </InfoRow>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}

interface InfoRowProps { label: string; value?: string; children?: ReactNode }

function InfoRow({ label, value, children }: InfoRowProps) {
  if (!value && !children) return null;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
      <p className="text-white/35 w-32 shrink-0 text-xs pt-0.5">{label}</p>
      <div className="flex-1 min-w-0">
        {children ?? <p className="text-white/80 text-sm break-words">{value}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript — run `cd frontend && npm run typecheck`**

Expected: zero errors.

---

### Task 7: App.tsx + DashboardLayout Wiring

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/layout/DashboardLayout.tsx`

**Interfaces:**
- Consumes: `OrderDetailPage` from `@/pages/client/OrderDetailPage`, `ClientPaymentsPage` from `@/pages/client/ClientPaymentsPage`, `ProviderOrdersPage` from `@/pages/provider/ProviderOrdersPage`, `ProviderOrderDetailPage` from `@/pages/provider/ProviderOrderDetailPage`

- [ ] **Step 1: Add imports to `frontend/src/App.tsx`**

After the existing `import { MyOrdersPage } from '@/pages/client/MyOrdersPage';` line (line 18), add:

```tsx
import { OrderDetailPage } from '@/pages/client/OrderDetailPage';
import { ClientPaymentsPage } from '@/pages/client/ClientPaymentsPage';
```

After the existing `import { MyQuotesPage } from '@/pages/provider/MyQuotesPage';` line (line 21), add:

```tsx
import { ProviderOrdersPage } from '@/pages/provider/ProviderOrdersPage';
import { ProviderOrderDetailPage } from '@/pages/provider/ProviderOrderDetailPage';
```

- [ ] **Step 2: Add client routes to `frontend/src/App.tsx`**

After the existing `<Route path="/cliente/ordens" element={<MyOrdersPage />} />` line (line 52), add:

```tsx
<Route path="/cliente/ordens/:id" element={<OrderDetailPage />} />
<Route path="/cliente/pagamentos" element={<ClientPaymentsPage />} />
```

- [ ] **Step 3: Add provider routes to `frontend/src/App.tsx`**

After the existing `<Route path="/prestador/orcamentos" element={<MyQuotesPage />} />` line (line 63), add:

```tsx
<Route path="/prestador/ordens" element={<ProviderOrdersPage />} />
<Route path="/prestador/ordens/:id" element={<ProviderOrderDetailPage />} />
```

- [ ] **Step 4: Enable client Pagamentos in `frontend/src/components/layout/DashboardLayout.tsx`**

Find line 30:
```tsx
{ label: 'Pagamentos', to: '/cliente/pagamentos', icon: <CreditCard className="h-4 w-4" />, disabled: true },
```

Change to:
```tsx
{ label: 'Pagamentos', to: '/cliente/pagamentos', icon: <CreditCard className="h-4 w-4" /> },
```

- [ ] **Step 5: Enable provider Ordens in `frontend/src/components/layout/DashboardLayout.tsx`**

Find line 39:
```tsx
{ label: 'Ordens', to: '/prestador/ordens', icon: <ClipboardList className="h-4 w-4" />, disabled: true },
```

Change to:
```tsx
{ label: 'Ordens', to: '/prestador/ordens', icon: <ClipboardList className="h-4 w-4" /> },
```

---

### Task 8: Validation

**Files:** None created. Verification only.

- [ ] **Step 1: Run TypeScript check**

```bash
cd frontend && npm run typecheck
```

Expected output: Zero errors. If errors appear, fix before continuing.

- [ ] **Step 2: Run production build**

```bash
cd frontend && npm run build
```

Expected output: Build completes successfully. A chunk size advisory warning (>500 kB) is acceptable — it is NOT an error. Any actual build error must be fixed.

- [ ] **Step 3: Manual smoke test checklist**

Start the frontend (`npm run dev` in `frontend/`) and verify:

1. Login cliente → "Minhas Ordens" in nav works → cards now link to `/cliente/ordens/:id` (not to solicitações)
2. "Pagamentos" in client nav is no longer disabled (no "BREVE" badge)
3. Login prestador → "Ordens" in nav is no longer disabled
4. Navigate to `/prestador/ordens` → page loads without error (empty state if no orders)
5. Navigate to `/cliente/pagamentos` → page loads without error (empty state if no payments)
6. No TypeScript errors, no build errors

---

## Implementation Order

Execute tasks sequentially in this order: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8.

Tasks 3–6 (pages) may be done in any order, but Task 1 (services) must be done first since pages import from services.

## End-to-End Test Flow (after all tasks complete)

1. Login cliente → criar solicitação
2. Login prestador → enviar orçamento
3. Login cliente → aceitar orçamento → Minhas Ordens → abrir ordem → status `created`
4. Clicar "Pagar sinal simulado" → status muda para `scheduled`
5. Login prestador → Ordens → abrir ordem → clicar "Iniciar serviço" → status `in_progress`
6. Clicar "Marcar como aguardando aprovação" → status `waiting_approval`
7. Login cliente → abrir ordem → clicar "Aprovar conclusão" → status `completed`
8. Clicar "Pagar restante simulado" → botão desaparece após pagamento
9. Abrir `/cliente/pagamentos` → 2 pagamentos listados
