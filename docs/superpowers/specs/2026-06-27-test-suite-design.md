# Spec: Suíte de Testes Automatizados — MãoCerta

**Data:** 27 de junho de 2026
**Aprovado por:** Ruan
**Abordagem:** C — Full stack com factories

---

## Contexto

A plataforma MãoCerta tem cobertura de testes de ~5% (2 services no backend, 1 contexto no frontend). A infraestrutura já existe e está pronta (Jest + mongodb-memory-server no backend, Vitest + jsdom no frontend). O objetivo é expandir para cobertura ampla dos services e rotas HTTP do backend, e services + componentes críticos do frontend, usando um arquivo de helpers/factories compartilhado para evitar duplicação de código de setup.

---

## Arquitetura

### Infraestrutura existente (não mudar)

- `backend/src/__tests__/setup.ts` — cria/destrói MongoMemoryServer; limpa coleções em `afterEach`
- `backend/jest.config.ts` — ts-jest, cobertura em `coverage/`, path alias `@/`
- `frontend/src/__tests__/setup.ts` — importa `@testing-library/jest-dom`
- `frontend/vite.config.ts` — seção `test` com jsdom, globals, path alias `@/`

### Novos arquivos helpers (backend)

**`backend/src/__tests__/helpers/factories.ts`**

Exports: `createUser`, `createProvider`, `createCategory`, `createServiceRequest`, `createQuote`, `createOrder`, `createPayment`, `createReview`

- `createUser(overrides?)` — cria User com role `client`, email único via `Date.now()+Math.random()`, senha `Senha@1234` hashada, status `active`
- `createProvider(overrides?)` — cria User(provider) + ProviderProfile(status:`approved`, plan:`free`); retorna `{ user, profile }`
- `createCategory(overrides?)` — slug único automático
- `createServiceRequest(clientId, categoryId, overrides?)` — status `open`, urgency `medium`
- `createQuote(serviceRequestId, providerId, overrides?)` — totalAmount `500`, status `sent`
- `createOrder(clientId, providerId, serviceRequestId, quoteId, overrides?)` — status `created`
- `createPayment(orderId, clientId, providerId, overrides?)` — type `deposit`, status `paid`, amount `250`
- `createReview(orderId, clientId, providerId, overrides?)` — rating `5`

**`backend/src/__tests__/helpers/auth.ts`**

- `getAuthToken(userId, role)` — gera JWT usando `process.env.JWT_SECRET || 'test_secret'`, expiry `1h`
- `getAuthHeader(userId, role)` — retorna `{ Authorization: 'Bearer <token>' }`

---

## Backend — Service Tests (8 novos arquivos)

Padrão: integração real com banco (mongodb-memory-server), sem mocks de Mongoose, usa factories.

### `order.service.test.ts`
- `getMy` — retorna ordens do cliente; retorna ordens do prestador
- `getById` — owner (client) pode ver; provider da ordem pode ver; usuário não relacionado → ForbiddenError
- `updateStatus` — transições válidas: `created→scheduled`, `scheduled→in_progress` (requer Payment deposit paid), `in_progress→waiting_approval`
- `updateStatus` — transição inválida (e.g. `created→completed`) → AppError
- `approveCompletion` — só cliente da ordem pode aprovar; muda status para `completed`

### `quote.service.test.ts`
- `create` — prestador aprovado envia orçamento com sucesso
- `create` — prestador não aprovado → AppError 403
- `create` — segundo orçamento do mesmo prestador para mesma SR → ConflictError
- `accept` — aceitar quote válido: cria Order, rejeita outros quotes, atualiza SR para `scheduled`
- `accept` — cliente errado tentando aceitar → ForbiddenError + quote volta para `sent`
- `reject` — muda status para `rejected`
- `getMy` como provider — retorna só quotes do provider
- `getMy` como client — retorna quotes das SRs do cliente

### `serviceRequest.service.test.ts`
- `create` — cliente cria SR com campos corretos
- `getMy` — retorna apenas SRs do usuário autenticado
- `getById` como owner — retorna com `fullAddress`
- `getById` sem autenticação — retorna sem `fullAddress` e sem `budgetMax`
- `cancel` — owner pode cancelar SR com status `open`
- `cancel` — não-owner → ForbiddenError

### `payment.service.test.ts`
- `simulateDeposit` — cria Payment com type `deposit`, status `paid`, amount = 50% do quote
- `simulateDeposit` já pago → ConflictError
- `simulateRemaining` — cria Payment com type `remaining`, status `paid`
- `simulateRemaining` sem depósito pago → AppError

### `review.service.test.ts`
- `create` — só pode criar review para ordem `completed`
- `create` — ordem não `completed` → AppError
- `create` — review duplicada na mesma ordem → ConflictError
- `getMy` — retorna reviews do usuário
- `getByProvider` — retorna reviews do prestador com média

### `admin.service.test.ts`
- `blockUser` — seta status `blocked`, cria AuditLog com action `block_user`
- `blockUser` de si mesmo → AppError
- `blockUser` do último admin → AppError
- `unblockUser` — seta status `active`, cria AuditLog
- `deleteUser` — soft delete (status `deleted`), cria AuditLog
- `approveProvider` — seta profile status `approved`, cria AuditLog
- `getStats` — retorna counts corretos de users/requests/orders/disputes

### `provider.service.test.ts`
- `getMe` — retorna perfil do prestador com categories populadas
- `updateMe` — atualiza bio, cidades; campos não enviados não são alterados
- `search` — filtra por city; filtra por category; retorna paginado

### `email.service.test.ts`
- Em dev (RESEND_API_KEY = `re_dev_placeholder`) — `console.log` é chamado, Resend não é chamado
- `safeUrl` com `javascript:` → retorna `#`
- `safeUrl` com URL válida → retorna URL escapada
- Strings com `<script>` em nome → escapadas no HTML gerado

---

## Backend — HTTP Tests via Supertest (4 novos arquivos em `routes/`)

Padrão: usa `supertest(app)`, usa `getAuthHeader()` para autenticação, dados via factories.

### `auth.routes.test.ts`
- `POST /api/auth/register/client` → 201, body contém `user`, cookies `accessToken` + `refreshToken` presentes
- `POST /api/auth/register/client` email duplicado → 409
- `POST /api/auth/login` credenciais corretas → 200, cookies presentes
- `POST /api/auth/login` senha errada → 401
- `POST /api/auth/refresh` com cookie válido → 200, novo `accessToken` cookie
- `POST /api/auth/logout` autenticado → 200, cookies limpos
- `GET /api/auth/me` sem token → 401
- `GET /api/auth/me` com token válido → 200

### `quote.routes.test.ts`
- `POST /api/quotes` sem auth → 401
- `POST /api/quotes` como client → 403
- `POST /api/quotes` como provider não aprovado → 403/400
- `POST /api/quotes` como provider aprovado → 201
- `PATCH /api/quotes/:id/accept` não-owner → 403
- `PATCH /api/quotes/:id/accept` owner → 201, body contém Order criada

### `order.routes.test.ts`
- `GET /api/orders` sem auth → 401
- `GET /api/orders` como cliente → 200, apenas suas ordens
- `PATCH /api/orders/:id/status` com status inválido → 400 (Zod validation)
- `PATCH /api/orders/:id/status` transição válida → 200

### `serviceRequest.routes.test.ts`
- `POST /api/service-requests` sem auth → 401
- `POST /api/service-requests` como provider → 403
- `POST /api/service-requests` como client → 201
- `GET /api/service-requests/:id` sem auth → 200, sem `fullAddress` no body
- `GET /api/service-requests/:id` como owner → 200, com `fullAddress`
- `DELETE /api/service-requests/:id` não-owner → 403

---

## Frontend — Service Tests (10 novos arquivos em `services/`)

Padrão: `vi.mock('@/lib/axios')` mockando os métodos HTTP; verifica que cada service chama o endpoint correto com os parâmetros corretos.

Arquivos: `auth.service.test.ts`, `order.service.test.ts`, `quote.service.test.ts`, `review.service.test.ts`, `dispute.service.test.ts`, `serviceRequest.service.test.ts`, `payment.service.test.ts`, `admin.service.test.ts`, `provider.service.test.ts`, `category.service.test.ts`

Para cada service, verificar:
- Método HTTP correto (get/post/patch/delete)
- URL correta (ex: `/orders/my`, `/quotes/:id/accept`)
- Payload enviado quando aplicável
- Retorno correto do dado extraído de `res.data.data`

---

## Frontend — Component Tests (5 novos arquivos em `components/`)

### `StatusBadge.test.tsx`
- Renderiza label correto para cada status: `open`, `quoted`, `in_progress`, `waiting_approval`, `completed`, `cancelled`, `sent`, `accepted`, `rejected`
- Cada status tem a classe de cor correta (verde para completed, vermelho para cancelled, etc.)

### `EmptyState.test.tsx`
- Renderiza `title` e `description` passados como props
- Renderiza botão de CTA quando `actionLabel` + `onAction` são fornecidos
- Não renderiza botão quando não há `onAction`

### `ProtectedRoute.test.tsx`
- Redireciona para `/login` quando `user` é null e `isLoading` é false
- Exibe Spinner quando `isLoading` é true
- Renderiza children quando user está autenticado com role correta
- Redireciona para `/login` quando user tem role errada

### `RoleRedirect.test.tsx`
- Redireciona `client` para `/cliente`
- Redireciona `provider` para `/prestador`
- Redireciona `admin` para `/admin`

### `Spinner.test.tsx`
- Renderiza sem erros
- Possui elemento acessível (role ou aria-label)

---

## Cobertura Esperada

| Área | Antes | Depois |
|------|-------|--------|
| Backend services | 2/10 (20%) | 10/10 (100%) |
| Backend rotas HTTP | 0/10 (0%) | 4/10 (40%) |
| Frontend services | 0/11 (0%) | 10/11 (91%) |
| Frontend componentes | 1/22 (5%) | 6/22 (27%) |
| Linhas de código testadas (estimado) | ~5% | ~60–70% |

---

## Verificação

```bash
# Backend — rodar todos os testes
cd backend && npm test

# Backend — com cobertura
cd backend && npm test -- --coverage

# Frontend — rodar todos os testes
cd frontend && npm test

# Esperado: todos os testes passando, zero erros TypeScript
cd backend && npm run build
cd frontend && npm run typecheck
```
