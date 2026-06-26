# Etapa 3C-A — Ordens e Pagamento Simulado

**Data:** 2026-06-26  
**Projeto:** MãoCerta  
**Escopo:** Frontend apenas — backend 100% implementado

---

## Contexto

O fluxo de negócio já funciona no backend: cliente cria solicitação, prestador envia orçamento, cliente aceita e o backend gera uma `Order`. Esta etapa ativa o frontend para que cliente e prestador possam interagir com a ordem criada, incluindo pagamentos simulados de sinal (20%) e restante (80%).

Nenhuma integração de gateway real. Tudo simulado via endpoints `simulate` já existentes.

---

## Estado atual (pré-implementação)

### Backend — todos os endpoints existem e funcionam

| Endpoint | Comportamento |
|----------|--------------|
| `GET /orders/my` | Lista ordens do usuário logado (filtra por role) |
| `GET /orders/:id` | Detalhe completo da ordem (valida ownership) |
| `PATCH /orders/:id/status` | Atualiza status (provider/admin only) |
| `PATCH /orders/:id/approve-completion` | Cliente aprova conclusão |
| `POST /payments/:orderId/deposit/simulate` | Paga sinal 20%, move ordem para `scheduled` |
| `POST /payments/:orderId/remaining/simulate` | Paga restante 80% (exige status `completed`) |
| `GET /payments/my` | Lista pagamentos do usuário logado |

### State machine de ordens (backend)

```
created ──[cliente paga sinal]──► scheduled
scheduled ──[prestador: PATCH status in_progress]──► in_progress  (exige deposit pago)
in_progress ──[prestador: PATCH status waiting_approval]──► waiting_approval
waiting_approval ──[cliente: PATCH approve-completion]──► completed
completed ──[cliente paga restante]──► completed  (sem mudança de status)
```

**Restrição importante:** `scheduled → in_progress` é bloqueado pelo backend se não houver `Payment` do tipo `deposit` com `status: 'paid'`. Ou seja, o prestador só consegue iniciar o serviço depois que o cliente pagar o sinal.

### Frontend — gaps

| Item | Situação |
|------|----------|
| `payment.service.ts` | Não existe |
| `order.service.ts` — `updateStatus`, `approveCompletion` | Faltam |
| `/cliente/ordens/:id` | Não existe |
| `/cliente/pagamentos` | Sem rota registrada |
| `/prestador/ordens` | Sem rota, nav desabilitado |
| `/prestador/ordens/:id` | Não existe |
| `MyOrdersPage` (cliente) | Navega para solicitação, não para ordem |

---

## Arquitetura de implementação

### Design global

- **Sem dados fake.** Toda UI vem da API.
- **Dark glassmorphism** — mesmo padrão das outras páginas (ver `UsersPage.tsx`, `OrdersPage.tsx`).
- **`import type { ReactNode }` em vez de `React.ReactNode`** — padrão TypeScript do projeto.
- **Tailwind opacity válido** — apenas `/5`, `/10`, `/20`, `/25`, `/30`, `/35`, `/40`, `/50` etc. Sem `/3` ou `/8`.
- Serviços centralizados — sem Axios direto nas páginas.
- `formatCurrency`, `formatDate`, `formatDateTime` de `@/lib/utils`.
- `fadeUp` de `@/lib/animations`.

### Verificação de pagamento na tela de detalhe

Chamar em paralelo: `GET /orders/:id` + `GET /payments/my`. Filtrar payments por `orderId` para determinar:
- `hasDeposit`: existe payment `type: 'deposit'` e `status: 'paid'`
- `hasRemaining`: existe payment `type: 'remaining'` e `status: 'paid'`

Isso determina quais botões de ação exibir.

---

## Tipos TypeScript necessários

### `Order` (completar tipo existente se necessário)

```typescript
interface Order {
  _id: string;
  serviceRequestId?: { description?: string; city?: string; urgency?: string; approximateAddress?: string };
  quoteId?: { totalAmount: number; depositAmount: number; remainingAmount: number; estimatedTime?: string; warrantyDays?: number; description?: string };
  clientId?: { _id?: string; name: string; phone?: string };
  providerId?: { _id?: string; name: string; phone?: string };
  status: 'created' | 'scheduled' | 'in_progress' | 'waiting_approval' | 'completed' | 'cancelled';
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  clientSignature?: string;
  providerSignature?: string;
  createdAt: string;
}
```

### `Payment` (novo)

```typescript
interface Payment {
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
```

---

## Arquivos a criar/modificar

### 1. `frontend/src/services/payment.service.ts` (novo)

```typescript
simulateDeposit(orderId: string): Promise<Payment>
simulateRemaining(orderId: string): Promise<Payment>
getMy(): Promise<Payment[]>
```

Envelope de resposta: `res.data.data` (padrão do projeto).

### 2. `frontend/src/services/order.service.ts` (completar)

Adicionar aos métodos existentes (`getMy`, `getById`):
```typescript
updateStatus(id: string, status: string): Promise<Order>
approveCompletion(id: string): Promise<Order>
```

### 3. `frontend/src/pages/client/MyOrdersPage.tsx` (corrigir)

- Fix: cada card deve navegar para `/cliente/ordens/${order._id}`, não para a solicitação.
- Manter o restante da página (listagem, badges de status, empty state).

### 4. `frontend/src/pages/client/OrderDetailPage.tsx` (novo)

Rota: `/cliente/ordens/:id`

**Dados:** `orderService.getById(id)` + `paymentService.getMy()` em paralelo. Filtrar payments por `orderId === id`.

**Layout:**
- Header: código curto `#${id.slice(-6).toUpperCase()}` + badge de status
- Seção: Informações do serviço (da serviceRequestId populada)
- Seção: Dados do orçamento (valor total, sinal, restante, tempo estimado)
- Seção: Prestador (nome, telefone)
- Seção: Linha do tempo de status

**Ações (condicionais):**

| Condição | Ação exibida |
|----------|-------------|
| `status === 'created'` e `!hasDeposit` | Botão "Pagar sinal simulado — {formatCurrency(depositAmount)}" |
| `status === 'waiting_approval'` | Botão "Aprovar conclusão" |
| `status === 'completed'` e `hasDeposit` e `!hasRemaining` | Botão "Pagar restante simulado — {formatCurrency(remainingAmount)}" |

**Aviso obrigatório** (sempre visível, estilo amber):
> "Este pagamento é simulado e não representa uma transação financeira real."

**Empty state:** Loading state (skeleton) + erro com retry.

### 5. `frontend/src/pages/client/ClientPaymentsPage.tsx` (novo)

Rota: `/cliente/pagamentos`

Chama `paymentService.getMy()`. Lista simples de pagamentos do cliente com:
- Tipo (Sinal / Restante / Total)
- Valor (`formatCurrency`)
- Status (badge)
- Data
- Click → link para `/cliente/ordens/${orderId}` se orderId disponível

Empty state: "Nenhum pagamento realizado ainda." + link para `/cliente/ordens`.

### 6. `frontend/src/pages/provider/ProviderOrdersPage.tsx` (novo)

Rota: `/prestador/ordens`

Chama `orderService.getMy()`. Lista cards com:
- ID curto
- Cliente (nome)
- Status (badge)
- Valor total (`quoteId.totalAmount`)
- Data agendada (se existir)
- Link "Ver detalhes" → `/prestador/ordens/:id`

### 7. `frontend/src/pages/provider/ProviderOrderDetailPage.tsx` (novo)

Rota: `/prestador/ordens/:id`

Chama `orderService.getById(id)`.

**Layout:**
- Header: código curto + badge de status
- Seção: Cliente (nome, telefone)
- Seção: Serviço (descrição, cidade, urgência)
- Seção: Orçamento (valores, tempo estimado, garantia)
- Seção: Observações (se existirem)

**Ações (condicionais — apenas provider):**

| Condição | Ação exibida |
|----------|-------------|
| `status === 'scheduled'` | Botão "Iniciar serviço" → `updateStatus('in_progress')` |
| `status === 'in_progress'` | Botão "Marcar como aguardando aprovação" → `updateStatus('waiting_approval')` |

**Nota:** O prestador não pode aprovar conclusão — é ação exclusiva do cliente.

**Aviso quando `status === 'scheduled'`:** mostrar info de que o cliente já pagou o sinal para que o serviço seja iniciado.

**Loading state:** botão exibe spinner e fica desabilitado durante a requisição. Sem modal de confirmação separado — consistente com o padrão das outras telas admin/dashboard do projeto.

### 8. `frontend/src/App.tsx` (modificar)

Adicionar imports e rotas:
```
/cliente/ordens/:id         → OrderDetailPage
/cliente/pagamentos         → ClientPaymentsPage
/prestador/ordens           → ProviderOrdersPage
/prestador/ordens/:id       → ProviderOrderDetailPage
```

### 9. `frontend/src/components/layout/DashboardLayout.tsx` (modificar)

Remover `disabled: true` de:
- Client: `Pagamentos` (`/cliente/pagamentos`)
- Provider: `Ordens` (`/prestador/ordens`)

Manter `disabled: true` em:
- Client: `Avaliações`
- Provider: `Avaliações`

---

## Status badges — referência visual

```typescript
const ORDER_STATUS = {
  created:          { label: 'Aguardando sinal',    cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  scheduled:        { label: 'Agendada',             cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  in_progress:      { label: 'Em andamento',         cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  waiting_approval: { label: 'Aguard. aprovação',    cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  completed:        { label: 'Concluída',             cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelada',             cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};
```

---

## Tratamento de erros e loading

- Todas as páginas: loading skeleton + error state com mensagem amigável
- Ações (botões): estado `loading` no botão + desabilitar durante a requisição
- Erros de ação: exibir mensagem inline (não redirecionar)
- Se backend retornar 409 (depósito duplicado), exibir: "Pagamento já realizado."
- Se backend bloquear `in_progress` por falta de depósito, exibir: "O cliente ainda não pagou o sinal."

---

## O que NÃO está incluído nesta etapa

- Avaliações (Etapa 3C-B)
- Upload de fotos (`PATCH /orders/:id/photos`) — endpoint existe mas não será exposto na UI
- Assinaturas (`PATCH /orders/:id/signatures`) — não exposto na UI
- PDF
- Qualquer gateway real

---

## Validação

```bash
cd frontend && npm run typecheck   # zero erros TypeScript
cd frontend && npm run build       # build concluído sem erros
```

Nenhuma alteração de backend — não é necessário rodar typecheck/build do backend.

---

## Fluxo de teste manual

1. Login cliente → criar solicitação
2. Login prestador → enviar orçamento
3. Login cliente → aceitar orçamento → abrir `/cliente/ordens` → ver ordem com status `created`
4. Abrir detalhe `/cliente/ordens/:id` → clicar "Pagar sinal simulado"
5. Confirmar que status mudou para `scheduled`
6. Login prestador → abrir `/prestador/ordens` → abrir detalhe → clicar "Iniciar serviço"
7. Confirmar status `in_progress`
8. Prestador clica "Marcar como aguardando aprovação"
9. Login cliente → abrir ordem → clicar "Aprovar conclusão"
10. Confirmar status `completed`
11. Cliente clica "Pagar restante simulado"
12. Abrir `/cliente/pagamentos` → confirmar 2 pagamentos listados
