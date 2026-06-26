# Admin Etapa 1 — Limpeza de dados demo + Ativação das telas administrativas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remover dados de demonstração incontrolados, ativar as 3 telas admin faltantes (Solicitações, Ordens, Disputas) e completar o service admin no frontend.

**Architecture:** Backend já possui todos os endpoints necessários — nenhuma rota nova. Seeds agora obedecerão `SEED_DEMO_DATA` env var. Frontend ganha 3 novas páginas admin no padrão dark glassmorphism existente, sidebar e router atualizados.

**Tech Stack:** Node.js/Express/TypeScript (backend), React 18/Vite/TypeScript/Tailwind/Framer Motion (frontend), MongoDB/Mongoose.

## Global Constraints

- Não criar endpoints novos — usar apenas os existentes.
- Não alterar login, cadastro, solicitações de cliente/prestador, ou orçamentos.
- Não ativar tela de pagamentos — manter "BREVE".
- Não usar dados mockados no frontend.
- Design: dark glassmorphism inline (não usar componentes light-theme de `src/components/ui/`).
- TypeScript estrito — sem `any` desnecessário.
- Padrão de resposta da API: `res.data.data.<chave>` (envelope `{ success, data }`).
- `npm run typecheck && npm run build` devem passar sem erros ao final.

---

## Análise — O que já existe

### Backend — Endpoints admin (todos já existem)
| Método | Rota | Retorno |
|--------|------|---------|
| GET | `/admin/stats` | stats object |
| GET | `/admin/users?limit=N` | `{ users, total, page, limit }` |
| GET | `/admin/providers?limit=N` | `{ providers, total, page, limit }` |
| PATCH | `/admin/providers/:id/approve` | profile |
| PATCH | `/admin/providers/:id/block` | profile |
| GET | `/admin/service-requests?limit=N` | `{ requests, total, page, limit }` |
| GET | `/admin/orders?limit=N` | `{ orders, total, page, limit }` |
| GET | `/admin/disputes?limit=N` | `{ disputes, total, page, limit }` |
| PATCH | `/admin/disputes/:id/status` | dispute (body: `{ status, adminNotes }`) |

### Frontend — O que já existe e funciona
- `/admin` → `AdminDashboardPage` ✅
- `/admin/usuarios` → `AdminUsersPage` ✅ (consome real API, sem demo data)
- `/admin/prestadores` → `AdminProvidersPage` ✅ (consome real API, com aprovar/bloquear)
- `admin.service.ts` → stub vazio `export const adminService = {};`
- Sidebar: Solicitações, Ordens, Pagamentos, Disputas com `disabled: true`
- Login: sem dados demo

### Demo data — situação atual
- `seed.ts` cria clientes/prestadores/solicitações/orçamentos demo quando `NODE_ENV !== 'production'`
- **Sem** variável `SEED_DEMO_DATA`
- Nenhum dado fake no frontend (páginas já consomem API real)

---

## Populate disponível nos endpoints

**`/admin/service-requests`** popula:
- `clientId`: `name email`
- `categoryId`: `name slug`
- `selectedProviderId`: **não populado** (ObjectId bruto ou null)

**`/admin/orders`** popula:
- `clientId`: `name email`
- `providerId`: `name email`
- `quoteId`: `totalAmount depositAmount remainingAmount`

**`/admin/disputes`** popula:
- `openedBy`: `name email`
- `orderId`: `clientId providerId status` (IDs brutos, não populados recursivamente)

---

## Task 1: Backend — Adicionar SEED_DEMO_DATA ao env

**Files:**
- Modify: `backend/src/config/env.ts`
- Modify: `backend/src/seeds/seed.ts`

**Interfaces:**
- Produces: `env.SEED_DEMO_DATA: boolean` — usado em seed.ts

- [ ] **Step 1: Adicionar SEED_DEMO_DATA ao env.ts**

Em `backend/src/config/env.ts`, adicionar após `USE_MEMORY_DB`:

```typescript
SEED_DEMO_DATA: process.env.SEED_DEMO_DATA === 'true',
```

Resultado esperado do `env` object:
```typescript
export const env = {
  // ... existing ...
  USE_MEMORY_DB: process.env.USE_MEMORY_DB === 'true',
  SEED_DEMO_DATA: process.env.SEED_DEMO_DATA === 'true',
  // ... rest ...
};
```

- [ ] **Step 2: Atualizar seed.ts para usar SEED_DEMO_DATA**

Em `backend/src/seeds/seed.ts`, linha 83, trocar:
```typescript
if (env.NODE_ENV !== 'production') {
```
por:
```typescript
if (env.SEED_DEMO_DATA) {
```

- [ ] **Step 3: Verificar .env.example se existir**

Verificar se `backend/.env.example` existe. Se sim, adicionar:
```env
SEED_DEMO_DATA=false
```

- [ ] **Step 4: Typecheck backend**

```bash
cd backend && npm run typecheck
```
Expected: zero erros TypeScript.

- [ ] **Step 5: Commit**

```bash
git add backend/src/config/env.ts backend/src/seeds/seed.ts
git commit -m "feat(seed): add SEED_DEMO_DATA env var to control demo data creation"
```

---

## Task 2: Frontend — Completar admin.service.ts

**Files:**
- Modify: `frontend/src/services/admin.service.ts`

**Interfaces:**
- Consumes: `api` from `@/lib/axios`
- Produces: métodos tipados para todas as telas admin

- [ ] **Step 1: Reescrever admin.service.ts com todos os métodos**

```typescript
import api from '@/lib/axios';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'provider' | 'admin';
  status: 'active' | 'blocked';
  city?: string;
  state?: string;
  phone?: string;
  createdAt: string;
}

export interface AdminProvider {
  _id: string;
  professionalName: string;
  document?: string;
  status: 'pending' | 'approved' | 'blocked';
  plan: string;
  cities: string[];
  averageRating: number;
  totalReviews: number;
  completedServices: number;
  createdAt: string;
  userId?: { name: string; email: string; phone?: string; city?: string; state?: string; status?: string };
  categories?: { name: string }[];
}

export interface AdminServiceRequest {
  _id: string;
  description: string;
  city: string;
  neighborhood?: string;
  approximateAddress?: string;
  fullAddress?: string;
  urgency: 'low' | 'medium' | 'high';
  status: string;
  desiredDate?: string;
  createdAt: string;
  clientId?: { name: string; email: string };
  categoryId?: { name: string; slug: string };
  selectedProviderId?: string | null;
}

export interface AdminOrder {
  _id: string;
  status: string;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  createdAt: string;
  clientId?: { name: string; email: string };
  providerId?: { name: string; email: string };
  quoteId?: { totalAmount: number; depositAmount: number; remainingAmount: number };
  serviceRequestId?: string;
}

export interface AdminDispute {
  _id: string;
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved_client' | 'resolved_provider' | 'refunded';
  adminNotes?: string;
  evidencePhotos?: string[];
  createdAt: string;
  openedBy?: { name: string; email: string };
  orderId?: { _id?: string; clientId?: string; providerId?: string; status?: string };
}

export type DisputeStatus = AdminDispute['status'];

async function getUsers(limit = 100) {
  const res = await api.get(`/admin/users?limit=${limit}`);
  const d = res.data.data;
  return { users: (d.users ?? d ?? []) as AdminUser[], total: (d.total ?? 0) as number };
}

async function getProviders(limit = 100) {
  const res = await api.get(`/admin/providers?limit=${limit}`);
  const d = res.data.data;
  return { providers: (d.providers ?? d ?? []) as AdminProvider[], total: (d.total ?? 0) as number };
}

async function approveProvider(id: string) {
  const res = await api.patch(`/admin/providers/${id}/approve`);
  return res.data.data as AdminProvider;
}

async function blockProvider(id: string) {
  const res = await api.patch(`/admin/providers/${id}/block`);
  return res.data.data as AdminProvider;
}

async function getServiceRequests(limit = 100) {
  const res = await api.get(`/admin/service-requests?limit=${limit}`);
  const d = res.data.data;
  return { requests: (d.requests ?? d ?? []) as AdminServiceRequest[], total: (d.total ?? 0) as number };
}

async function getOrders(limit = 100) {
  const res = await api.get(`/admin/orders?limit=${limit}`);
  const d = res.data.data;
  return { orders: (d.orders ?? d ?? []) as AdminOrder[], total: (d.total ?? 0) as number };
}

async function getDisputes(limit = 100) {
  const res = await api.get(`/admin/disputes?limit=${limit}`);
  const d = res.data.data;
  return { disputes: (d.disputes ?? d ?? []) as AdminDispute[], total: (d.total ?? 0) as number };
}

async function updateDisputeStatus(id: string, status: DisputeStatus, adminNotes?: string) {
  const res = await api.patch(`/admin/disputes/${id}/status`, { status, adminNotes });
  return res.data.data as AdminDispute;
}

export const adminService = {
  getUsers,
  getProviders,
  approveProvider,
  blockProvider,
  getServiceRequests,
  getOrders,
  getDisputes,
  updateDisputeStatus,
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/admin.service.ts
git commit -m "feat(admin): complete admin.service.ts with typed methods for all admin endpoints"
```

---

## Task 3: Frontend — Ativar sidebar + adicionar rotas

**Files:**
- Modify: `frontend/src/components/layout/DashboardLayout.tsx` (linhas 47-50)
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `AdminServiceRequestsPage`, `AdminOrdersPage`, `AdminDisputasPage` (criados em Tasks 4-6)
- Produces: rotas `/admin/solicitacoes`, `/admin/ordens`, `/admin/disputas` acessíveis

- [ ] **Step 1: Remover disabled de Solicitações, Ordens e Disputas na sidebar**

Em `DashboardLayout.tsx`, trocar o bloco admin de:
```typescript
{ label: 'Solicitações', to: '/admin/solicitacoes', icon: <FileText className="h-4 w-4" />, disabled: true },
{ label: 'Ordens', to: '/admin/ordens', icon: <ClipboardList className="h-4 w-4" />, disabled: true },
{ label: 'Pagamentos', to: '/admin/pagamentos', icon: <CreditCard className="h-4 w-4" />, disabled: true },
{ label: 'Disputas', to: '/admin/disputas', icon: <ShieldAlert className="h-4 w-4" />, disabled: true },
```
por:
```typescript
{ label: 'Solicitações', to: '/admin/solicitacoes', icon: <FileText className="h-4 w-4" /> },
{ label: 'Ordens', to: '/admin/ordens', icon: <ClipboardList className="h-4 w-4" /> },
{ label: 'Pagamentos', to: '/admin/pagamentos', icon: <CreditCard className="h-4 w-4" />, disabled: true },
{ label: 'Disputas', to: '/admin/disputas', icon: <ShieldAlert className="h-4 w-4" /> },
```

- [ ] **Step 2: Adicionar rotas em App.tsx**

Adicionar imports:
```typescript
import { AdminServiceRequestsPage } from '@/pages/admin/ServiceRequestsPage';
import { AdminOrdersPage } from '@/pages/admin/OrdersPage';
import { AdminDisputasPage } from '@/pages/admin/DisputasPage';
```

Adicionar rotas dentro do bloco admin:
```typescript
<Route path="/admin/solicitacoes" element={<AdminServiceRequestsPage />} />
<Route path="/admin/ordens" element={<AdminOrdersPage />} />
<Route path="/admin/disputas" element={<AdminDisputasPage />} />
```

- [ ] **Step 3: Commit (após criar as páginas nos Tasks 4-6)**

Este commit será feito junto com os Tasks 4-6.

---

## Task 4: Frontend — Criar AdminServiceRequestsPage

**Files:**
- Create: `frontend/src/pages/admin/ServiceRequestsPage.tsx`

**Interfaces:**
- Consumes: `adminService.getServiceRequests()` → `{ requests: AdminServiceRequest[], total: number }`
- Produces: export `AdminServiceRequestsPage`

**Dados disponíveis por item:**
- `_id`, `clientId.name`, `clientId.email`, `categoryId.name`, `city`, `neighborhood`, `urgency`, `status`, `createdAt`, `description`, `fullAddress`, `approximateAddress`, `desiredDate`, `selectedProviderId`

- [ ] **Step 1: Criar o arquivo completo**

```typescript
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, AlertCircle, X, MapPin, Clock, Filter } from 'lucide-react';
import { adminService, AdminServiceRequest } from '@/services/admin.service';
import { fadeUp } from '@/lib/animations';
import { formatDate, formatDateTime } from '@/lib/utils';

const URGENCY_CONFIG: Record<string, { label: string; cls: string }> = {
  low:    { label: 'Baixa',  cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  medium: { label: 'Média',  cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  high:   { label: 'Alta',   cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  open:             { label: 'Aberta',             cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  quoted:           { label: 'Orçada',             cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  scheduled:        { label: 'Agendada',            cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  in_progress:      { label: 'Em andamento',        cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  waiting_approval: { label: 'Aguard. aprovação',   cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  completed:        { label: 'Concluída',            cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelada',            cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  dispute:          { label: 'Disputa',              cls: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'open', label: 'Aberta' },
  { value: 'quoted', label: 'Orçada' },
  { value: 'scheduled', label: 'Agendada' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'waiting_approval', label: 'Aguard. aprovação' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'dispute', label: 'Disputa' },
];

export function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<AdminServiceRequest | null>(null);

  useEffect(() => {
    setLoading(true);
    adminService.getServiceRequests(200)
      .then(({ requests, total }) => { setRequests(requests); setTotal(total); })
      .catch(() => setError('Não foi possível carregar as solicitações.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter(r => {
    const matchSearch = !search ||
      (r.clientId?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.clientId?.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.city ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.categoryId?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-violet-400" /> Solicitações
          </h1>
          <p className="text-sm text-white/40 mt-1">{total} solicitaç{total !== 1 ? 'ões' : 'ão'} no total</p>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, categoria ou cidade..."
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5
              text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5
              text-sm text-white outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value} style={{ background: '#0d1530' }}>{o.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-2.5 bg-white/5 rounded w-1/3" />
                </div>
                <div className="h-5 w-16 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhuma solicitação encontrada.</p>
        </div>
      ) : (
        <motion.div {...fadeUp(0.1)} className="space-y-2">
          {filtered.map((r, i) => (
            <motion.div key={r._id} {...fadeUp(0.05 + i * 0.015)}
              className="flex items-center gap-4 rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.02)' }}
              onClick={() => setSelected(r)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/5">
                <FileText className="h-5 w-5 text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {r.categoryId?.name ?? '—'} · {r.clientId?.name ?? '—'}
                </p>
                <p className="text-xs text-white/35 truncate flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[r.city, r.neighborhood].filter(Boolean).join(', ') || '—'}
                </p>
                <p className="text-xs text-white/25">{formatDate(r.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {r.urgency && URGENCY_CONFIG[r.urgency] && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${URGENCY_CONFIG[r.urgency].cls}`}>
                    {URGENCY_CONFIG[r.urgency].label}
                  </span>
                )}
                {r.status && STATUS_CONFIG[r.status] && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[r.status].cls}`}>
                    {STATUS_CONFIG[r.status].label}
                  </span>
                )}
                <span className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Ver detalhes →</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal de detalhe */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setSelected(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
              style={{ background: 'linear-gradient(135deg, #0d1530 0%, #0a1428 100%)' }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelected(null)}
                className="absolute right-4 top-4 text-white/30 hover:text-white/70 transition-colors">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 pr-8">
                <FileText className="h-5 w-5 text-violet-400" />
                Detalhe da Solicitação
              </h2>
              <div className="space-y-3 text-sm">
                <DetailRow label="Categoria" value={selected.categoryId?.name} />
                <DetailRow label="Cliente" value={selected.clientId?.name} sub={selected.clientId?.email} />
                <DetailRow label="Status">
                  {selected.status && STATUS_CONFIG[selected.status] && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selected.status].cls}`}>
                      {STATUS_CONFIG[selected.status].label}
                    </span>
                  )}
                </DetailRow>
                <DetailRow label="Urgência">
                  {selected.urgency && URGENCY_CONFIG[selected.urgency] && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${URGENCY_CONFIG[selected.urgency].cls}`}>
                      {URGENCY_CONFIG[selected.urgency].label}
                    </span>
                  )}
                </DetailRow>
                <DetailRow label="Cidade/Bairro" value={[selected.city, selected.neighborhood].filter(Boolean).join(', ')} />
                <DetailRow label="Endereço aproximado" value={selected.approximateAddress} />
                <DetailRow label="Endereço completo" value={selected.fullAddress} />
                <DetailRow label="Data desejada" value={selected.desiredDate ? formatDateTime(selected.desiredDate) : undefined} />
                <DetailRow label="Criado em" value={formatDateTime(selected.createdAt)} />
                {selected.description && (
                  <div>
                    <p className="text-xs text-white/30 mb-1">Descrição</p>
                    <p className="text-white/70 text-sm rounded-xl border border-white/8 bg-white/3 p-3 leading-relaxed">
                      {selected.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value, sub, children }: { label: string; value?: string; sub?: string; children?: React.ReactNode }) {
  if (!value && !children) return null;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
      <p className="text-white/35 w-36 shrink-0 text-xs pt-0.5">{label}</p>
      <div className="flex-1 min-w-0">
        {children ?? <p className="text-white/80 text-sm">{value}</p>}
        {sub && <p className="text-white/35 text-xs">{sub}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Confirmar que o arquivo foi criado corretamente**

Verificar que o arquivo existe em `frontend/src/pages/admin/ServiceRequestsPage.tsx`.

---

## Task 5: Frontend — Criar AdminOrdersPage

**Files:**
- Create: `frontend/src/pages/admin/OrdersPage.tsx`

**Interfaces:**
- Consumes: `adminService.getOrders()` → `{ orders: AdminOrder[], total: number }`
- Produces: export `AdminOrdersPage`

**Dados disponíveis por item:**
- `_id`, `clientId.name/email`, `providerId.name/email`, `quoteId.totalAmount`, `status`, `scheduledDate`, `startedAt`, `completedAt`, `notes`, `beforePhotos[]`, `afterPhotos[]`

- [ ] **Step 1: Criar o arquivo completo**

```typescript
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Search, AlertCircle, X, Filter, User, Wrench } from 'lucide-react';
import { adminService, AdminOrder } from '@/services/admin.service';
import { fadeUp } from '@/lib/animations';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  created:          { label: 'Criada',              cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  scheduled:        { label: 'Agendada',             cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  in_progress:      { label: 'Em andamento',         cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  waiting_approval: { label: 'Aguard. aprovação',    cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  completed:        { label: 'Concluída',             cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelada',             cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'created', label: 'Criada' },
  { value: 'scheduled', label: 'Agendada' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'waiting_approval', label: 'Aguard. aprovação' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  useEffect(() => {
    setLoading(true);
    adminService.getOrders(200)
      .then(({ orders, total }) => { setOrders(orders); setTotal(total); })
      .catch(() => setError('Não foi possível carregar as ordens.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      (o.clientId?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (o.providerId?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-orange-400" /> Ordens
          </h1>
          <p className="text-sm text-white/40 mt-1">{total} ordem{total !== 1 ? 'ns' : ''} no total</p>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou prestador..."
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5
              text-sm text-white placeholder:text-white/20 outline-none focus:border-orange-500/50 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5
              text-sm text-white outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value} style={{ background: '#0d1530' }}>{o.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-2.5 bg-white/5 rounded w-1/3" />
                </div>
                <div className="h-5 w-20 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhuma ordem encontrada.</p>
        </div>
      ) : (
        <motion.div {...fadeUp(0.1)} className="space-y-2">
          {filtered.map((order, i) => (
            <motion.div key={order._id} {...fadeUp(0.05 + i * 0.015)}
              className="flex items-center gap-4 rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.02)' }}
              onClick={() => setSelected(order)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-white/5">
                <ClipboardList className="h-5 w-5 text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  #{order._id.slice(-6).toUpperCase()}
                </p>
                <p className="text-xs text-white/35 truncate flex items-center gap-2">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{order.clientId?.name ?? '—'}</span>
                  <span className="text-white/20">·</span>
                  <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{order.providerId?.name ?? '—'}</span>
                </p>
                {order.scheduledDate && (
                  <p className="text-xs text-white/25">Agendado: {formatDate(order.scheduledDate)}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {order.quoteId?.totalAmount != null && (
                  <span className="text-sm font-semibold text-emerald-400">{formatCurrency(order.quoteId.totalAmount)}</span>
                )}
                {order.status && STATUS_CONFIG[order.status] && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[order.status].cls}`}>
                    {STATUS_CONFIG[order.status].label}
                  </span>
                )}
                <span className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Ver detalhes →</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal de detalhe */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setSelected(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
              style={{ background: 'linear-gradient(135deg, #0d1530 0%, #0a1428 100%)' }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelected(null)}
                className="absolute right-4 top-4 text-white/30 hover:text-white/70 transition-colors">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 pr-8">
                <ClipboardList className="h-5 w-5 text-orange-400" />
                Ordem #{selected._id.slice(-6).toUpperCase()}
              </h2>
              <div className="space-y-3 text-sm">
                <ODetailRow label="Cliente" value={selected.clientId?.name} sub={selected.clientId?.email} />
                <ODetailRow label="Prestador" value={selected.providerId?.name} sub={selected.providerId?.email} />
                <ODetailRow label="Status">
                  {selected.status && STATUS_CONFIG[selected.status] && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selected.status].cls}`}>
                      {STATUS_CONFIG[selected.status].label}
                    </span>
                  )}
                </ODetailRow>
                {selected.quoteId && (
                  <>
                    <ODetailRow label="Valor total" value={formatCurrency(selected.quoteId.totalAmount)} />
                    <ODetailRow label="Depósito" value={formatCurrency(selected.quoteId.depositAmount)} />
                    <ODetailRow label="Restante" value={formatCurrency(selected.quoteId.remainingAmount)} />
                  </>
                )}
                <ODetailRow label="Agendado para" value={selected.scheduledDate ? formatDateTime(selected.scheduledDate) : undefined} />
                <ODetailRow label="Iniciado em" value={selected.startedAt ? formatDateTime(selected.startedAt) : undefined} />
                <ODetailRow label="Concluído em" value={selected.completedAt ? formatDateTime(selected.completedAt) : undefined} />
                <ODetailRow label="Criado em" value={formatDateTime(selected.createdAt)} />
                {selected.notes && <ODetailRow label="Observações" value={selected.notes} />}
                {(selected.beforePhotos?.length ?? 0) > 0 && (
                  <ODetailRow label="Fotos antes" value={`${selected.beforePhotos!.length} foto(s)`} />
                )}
                {(selected.afterPhotos?.length ?? 0) > 0 && (
                  <ODetailRow label="Fotos depois" value={`${selected.afterPhotos!.length} foto(s)`} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ODetailRow({ label, value, sub, children }: { label: string; value?: string; sub?: string; children?: React.ReactNode }) {
  if (!value && !children) return null;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
      <p className="text-white/35 w-32 shrink-0 text-xs pt-0.5">{label}</p>
      <div className="flex-1 min-w-0">
        {children ?? <p className="text-white/80 text-sm">{value}</p>}
        {sub && <p className="text-white/35 text-xs">{sub}</p>}
      </div>
    </div>
  );
}
```

---

## Task 6: Frontend — Criar AdminDisputasPage

**Files:**
- Create: `frontend/src/pages/admin/DisputasPage.tsx`

**Interfaces:**
- Consumes: `adminService.getDisputes()` → `{ disputes: AdminDispute[], total: number }`
- Consumes: `adminService.updateDisputeStatus(id, status, adminNotes)`
- Produces: export `AdminDisputasPage`

**Dados disponíveis por item:**
- `_id`, `reason`, `description`, `status`, `adminNotes`, `evidencePhotos[]`, `createdAt`
- `openedBy.name/email`, `orderId._id/status`

- [ ] **Step 1: Criar o arquivo completo**

```typescript
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertCircle, X, ChevronDown } from 'lucide-react';
import { adminService, AdminDispute, DisputeStatus } from '@/services/admin.service';
import { fadeUp } from '@/lib/animations';
import { formatDate, formatDateTime } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  open:              { label: 'Aberta',              cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  under_review:      { label: 'Em análise',          cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  resolved_client:   { label: 'Resolvido (cliente)', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  resolved_provider: { label: 'Resolvido (prestador)', cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  refunded:          { label: 'Reembolsado',         cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

const STATUS_OPTIONS: { value: DisputeStatus; label: string }[] = [
  { value: 'open', label: 'Aberta' },
  { value: 'under_review', label: 'Em análise' },
  { value: 'resolved_client', label: 'Resolvido (cliente)' },
  { value: 'resolved_provider', label: 'Resolvido (prestador)' },
  { value: 'refunded', label: 'Reembolsado' },
];

export function AdminDisputasPage() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<AdminDispute | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<DisputeStatus>('open');
  const [adminNotes, setAdminNotes] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    setLoading(true);
    adminService.getDisputes(200)
      .then(({ disputes, total }) => { setDisputes(disputes); setTotal(total); })
      .catch(() => setError('Não foi possível carregar as disputas.'))
      .finally(() => setLoading(false));
  }, []);

  const openModal = (d: AdminDispute) => {
    setSelected(d);
    setNewStatus(d.status);
    setAdminNotes(d.adminNotes ?? '');
    setUpdateError('');
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdating(true);
    setUpdateError('');
    try {
      const updated = await adminService.updateDisputeStatus(selected._id, newStatus, adminNotes || undefined);
      setDisputes(prev => prev.map(d => d._id === selected._id ? { ...d, ...updated } : d));
      setSelected(prev => prev ? { ...prev, status: newStatus, adminNotes: adminNotes || undefined } : null);
    } catch {
      setUpdateError('Não foi possível atualizar a disputa.');
    } finally {
      setUpdating(false);
    }
  };

  const open = disputes.filter(d => d.status === 'open' || d.status === 'under_review');
  const resolved = disputes.filter(d => d.status !== 'open' && d.status !== 'under_review');

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-400" /> Disputas
          </h1>
          <p className="text-sm text-white/40 mt-1">{total} disputa{total !== 1 ? 's' : ''} no total</p>
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="h-4 bg-white/5 rounded w-1/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhuma disputa registrada.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <motion.div {...fadeUp(0.1)}>
              <p className="text-xs font-semibold text-red-400/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5" /> Abertas / Em análise ({open.length})
              </p>
              <div className="space-y-2">
                {open.map((d, i) => <DisputeCard key={d._id} d={d} i={i} onOpen={openModal} />)}
              </div>
            </motion.div>
          )}
          {resolved.length > 0 && (
            <motion.div {...fadeUp(0.15)}>
              {open.length > 0 && (
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Resolvidas ({resolved.length})</p>
              )}
              <div className="space-y-2">
                {resolved.map((d, i) => <DisputeCard key={d._id} d={d} i={i} onOpen={openModal} />)}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Modal de detalhe + ação */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setSelected(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
              style={{ background: 'linear-gradient(135deg, #0d1530 0%, #0a1428 100%)' }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelected(null)}
                className="absolute right-4 top-4 text-white/30 hover:text-white/70 transition-colors">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 pr-8">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                Detalhe da Disputa
              </h2>
              <div className="space-y-3 text-sm mb-6">
                <DDetailRow label="Aberta por" value={selected.openedBy?.name} sub={selected.openedBy?.email} />
                <DDetailRow label="Motivo" value={selected.reason} />
                <DDetailRow label="Status atual">
                  {STATUS_CONFIG[selected.status] && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selected.status].cls}`}>
                      {STATUS_CONFIG[selected.status].label}
                    </span>
                  )}
                </DDetailRow>
                <DDetailRow label="Criado em" value={formatDateTime(selected.createdAt)} />
                {selected.description && (
                  <div>
                    <p className="text-xs text-white/30 mb-1">Descrição completa</p>
                    <p className="text-white/70 text-sm rounded-xl border border-white/8 bg-white/3 p-3 leading-relaxed">
                      {selected.description}
                    </p>
                  </div>
                )}
                {(selected.evidencePhotos?.length ?? 0) > 0 && (
                  <DDetailRow label="Evidências" value={`${selected.evidencePhotos!.length} foto(s) anexada(s)`} />
                )}
                {selected.adminNotes && (
                  <div>
                    <p className="text-xs text-white/30 mb-1">Notas admin atuais</p>
                    <p className="text-white/50 text-sm rounded-xl border border-white/8 bg-white/3 p-3">{selected.adminNotes}</p>
                  </div>
                )}
              </div>

              {/* Ação de atualizar status */}
              <div className="border-t border-white/8 pt-4 space-y-3">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Atualizar disputa</p>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as DisputeStatus)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-9
                      text-sm text-white outline-none focus:border-red-500/50 transition-all appearance-none cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {STATUS_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} style={{ background: '#0d1530' }}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Observações administrativas (opcional)..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3
                    text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-all resize-none"
                />
                {updateError && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {updateError}
                  </p>
                )}
                <button
                  onClick={handleUpdate}
                  disabled={updating || newStatus === selected.status && adminNotes === (selected.adminNotes ?? '')}
                  className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold
                    text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {updating ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DisputeCard({ d, i, onOpen }: { d: AdminDispute; i: number; onOpen: (d: AdminDispute) => void }) {
  return (
    <motion.div key={d._id} {...fadeUp(0.05 + i * 0.02)}
      className="rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.02)' }}
      onClick={() => onOpen(d)}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate">{d.reason}</p>
          <p className="text-xs text-white/35 truncate">{d.openedBy?.name ?? '—'} · {formatDate(d.createdAt)}</p>
        </div>
        <span className={`flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[d.status]?.cls}`}>
          {STATUS_CONFIG[d.status]?.label}
        </span>
      </div>
      {d.description && (
        <p className="text-xs text-white/30 line-clamp-2 mb-2">{d.description}</p>
      )}
      <p className="text-[11px] text-white/30 hover:text-white/60 transition-colors text-right">Ver detalhes →</p>
    </motion.div>
  );
}

function DDetailRow({ label, value, sub, children }: { label: string; value?: string; sub?: string; children?: React.ReactNode }) {
  if (!value && !children) return null;
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
      <p className="text-white/35 w-28 shrink-0 text-xs pt-0.5">{label}</p>
      <div className="flex-1 min-w-0">
        {children ?? <p className="text-white/80 text-sm">{value}</p>}
        {sub && <p className="text-white/35 text-xs">{sub}</p>}
      </div>
    </div>
  );
}
```

---

## Task 7: Conectar tudo — App.tsx + DashboardLayout + imports

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/layout/DashboardLayout.tsx`

- [ ] **Step 1: Adicionar imports e rotas em App.tsx**

Adicionar os 3 imports abaixo do import de `AdminProvidersPage`:
```typescript
import { AdminServiceRequestsPage } from '@/pages/admin/ServiceRequestsPage';
import { AdminOrdersPage } from '@/pages/admin/OrdersPage';
import { AdminDisputasPage } from '@/pages/admin/DisputasPage';
```

Adicionar dentro do bloco admin `<ProtectedRoute roles={['admin']}>`:
```typescript
<Route path="/admin/solicitacoes" element={<AdminServiceRequestsPage />} />
<Route path="/admin/ordens" element={<AdminOrdersPage />} />
<Route path="/admin/disputas" element={<AdminDisputasPage />} />
```

- [ ] **Step 2: Remover disabled de 3 itens em DashboardLayout.tsx**

Na função `useNavItems()`, bloco admin (return padrão), mudar:
- `Solicitações`: remover `disabled: true`
- `Ordens`: remover `disabled: true`
- `Disputas`: remover `disabled: true`
- Manter `Pagamentos` com `disabled: true`

- [ ] **Step 3: Commit geral de frontend**

```bash
git add frontend/src/App.tsx frontend/src/components/layout/DashboardLayout.tsx \
  frontend/src/pages/admin/ServiceRequestsPage.tsx \
  frontend/src/pages/admin/OrdersPage.tsx \
  frontend/src/pages/admin/DisputasPage.tsx
git commit -m "feat(admin): activate Solicitacoes, Ordens, Disputas admin screens"
```

---

## Task 8: Validação

- [ ] **Step 1: Typecheck frontend**

```bash
cd frontend && npm run typecheck
```
Expected: zero erros TypeScript.

- [ ] **Step 2: Build frontend**

```bash
cd frontend && npm run build
```
Expected: build completes with no errors.

- [ ] **Step 3: Typecheck backend**

```bash
cd backend && npm run typecheck
```
Expected: zero erros TypeScript.

- [ ] **Step 4: Verificação manual**

1. Iniciar backend: `cd backend && npm run dev`
2. Iniciar frontend: `cd frontend && npm run dev`
3. Login como admin em `/login`
4. Acessar `/admin` — dashboard com dados reais
5. Acessar `/admin/usuarios` — lista de usuários reais
6. Acessar `/admin/prestadores` — aprovar/bloquear funciona
7. Acessar `/admin/solicitacoes` — lista + modal de detalhe
8. Acessar `/admin/ordens` — lista + modal de detalhe
9. Acessar `/admin/disputas` — lista + atualizar status
10. Clicar em "Pagamentos" na sidebar → deve continuar como "BREVE" (não navega)
11. Confirmar: nenhum dado fake em nenhuma tela

---

## Checklist de spec coverage

- [x] Parte 1 Análise — coberta por este plano
- [x] Parte 2 Demo data — SEED_DEMO_DATA (Task 1)
- [x] Parte 3 Sidebar — Task 7 Step 2
- [x] Parte 4 Usuários — já existe (AdminUsersPage ativo)
- [x] Parte 5 Prestadores — já existe (AdminProvidersPage ativo)
- [x] Parte 6 Solicitações — Task 4
- [x] Parte 7 Ordens — Task 5
- [x] Parte 8 Disputas — Task 6
- [x] Parte 9 Pagamentos — mantido como BREVE (Task 7 Step 2)
- [x] Parte 10 admin.service.ts — Task 2
- [x] Parte 11 Design — dark glassmorphism em todas as páginas
- [x] Parte 12 Cuidados — nenhum endpoint inventado, seeds preservados, BREVE em pagamentos
