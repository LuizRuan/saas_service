# MãoCerta — Guia de Teste Manual da API

> **Base URL:** `http://localhost:3333/api`
>
> **Pré-requisito:** Servidor rodando com `npm run dev:memory`

---

## Usuários disponíveis após seed

| Tipo | Email | Senha | Status |
|---|---|---|---|
| Admin | `admin@maocerta.com` | `123456` | ativo |
| Cliente | `cliente@maocerta.com` | `123456` | ativo |
| Prestador | `prestador@maocerta.com` | `123456` | aprovado |

> O prestador demo já vem aprovado e com todas as categorias/cidades de teste.
> Você também pode criar usuários novos via registro.

---

## Como iniciar o servidor

```bash
# Com banco em memória (sem nenhuma configuração de banco)
npm run dev:memory

# Com .env configurado (se tiver USE_MEMORY_DB=true no .env)
npm run dev
```

Saída esperada no console:
```
🧪 MongoDB em memória iniciado (desenvolvimento local)
✅ MongoDB em memória pronto
🎉 Seed concluído com sucesso!

╔══════════════════════════════════════════════╗
║          🔧 MãoCerta API v1.0.0             ║
║   Porta:    3333                             ║
╚══════════════════════════════════════════════╝
```

---

## Fluxo principal de teste (16 passos)

### PASSO 1 — Login como Admin

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@maocerta.com",
  "password": "123456"
}
```

**Resultado esperado:** `200 OK` com `data.token`

> **Salve o token:** `TOKEN_ADMIN = data.token`

---

### PASSO 2 — Login como Cliente

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "cliente@maocerta.com",
  "password": "123456"
}
```

> **Salve o token:** `TOKEN_CLIENT = data.token`

---

### PASSO 3 — Login como Prestador

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "prestador@maocerta.com",
  "password": "123456"
}
```

> **Salve o token:** `TOKEN_PROVIDER = data.token`

---

### PASSO 4 — Verificar categorias disponíveis

```http
GET /api/categories
```

**Resultado esperado:** Array de 6 categorias  
> **Copie o `_id` da categoria "Eletricista"** (ou qualquer outra): `CATEGORY_ID`

---

### PASSO 5 — Cliente cria solicitação de serviço

```http
POST /api/service-requests
Authorization: Bearer TOKEN_CLIENT
Content-Type: application/json

{
  "categoryId": "CATEGORY_ID",
  "city": "São Paulo",
  "neighborhood": "Moema",
  "approximateAddress": "Av. Ibirapuera, próximo ao metrô",
  "fullAddress": "Av. Ibirapuera, 2927, ap 42, Moema, SP",
  "description": "Preciso de um eletricista para instalar 3 tomadas e revisar o quadro de energia do apartamento.",
  "urgency": "medium",
  "desiredDate": "2026-07-15T10:00:00.000Z"
}
```

**Resultado esperado:** `201 Created` com `data._id`  
> **Salve:** `REQUEST_ID = data._id`

---

### PASSO 6 — Prestador visualiza pedidos disponíveis

```http
GET /api/service-requests/available
Authorization: Bearer TOKEN_PROVIDER
```

**Resultado esperado:** Array com a solicitação criada  
> Verifique que `fullAddress` **NÃO aparece** na listagem

---

### PASSO 7 — Prestador envia orçamento

```http
POST /api/quotes
Authorization: Bearer TOKEN_PROVIDER
Content-Type: application/json

{
  "serviceRequestId": "REQUEST_ID",
  "totalAmount": 350,
  "description": "Inclui mão de obra, tomadas e revisão do quadro.",
  "estimatedTime": "4 horas",
  "warrantyDays": 30
}
```

**Resultado esperado:** `201 Created` com `data._id`, `depositAmount: 70`, `remainingAmount: 280`  
> **Salve:** `QUOTE_ID = data._id`

---

### PASSO 8 — Cliente visualiza orçamentos recebidos

```http
GET /api/quotes/request/REQUEST_ID
Authorization: Bearer TOKEN_CLIENT
```

**Resultado esperado:** Array com o orçamento enviado pelo prestador

---

### PASSO 9 — Cliente aceita o orçamento

```http
PATCH /api/quotes/QUOTE_ID/accept
Authorization: Bearer TOKEN_CLIENT
```

**Resultado esperado:** `200 OK` com `data._id` (a **Ordem de Serviço** criada)  
> **Salve:** `ORDER_ID = data._id`

Verifique também:
- `GET /api/service-requests/REQUEST_ID` → status deve ser `scheduled`
- `GET /api/orders/my` (cliente) → deve listar a ordem

---

### PASSO 10 — Cliente paga o sinal de 20%

```http
POST /api/payments/ORDER_ID/deposit/simulate
Authorization: Bearer TOKEN_CLIENT
```

**Resultado esperado:** `201 Created` com:
```json
{
  "type": "deposit",
  "amount": 70,
  "platformFee": 7,
  "providerAmount": 63,
  "gateway": "simulated",
  "status": "paid"
}
```

Verifique:
- `GET /api/orders/ORDER_ID` (cliente) → status deve ser `scheduled`

---

### PASSO 11 — Prestador inicia o serviço

```http
PATCH /api/orders/ORDER_ID/status
Authorization: Bearer TOKEN_PROVIDER
Content-Type: application/json

{
  "status": "in_progress"
}
```

**Resultado esperado:** `200 OK`, order status = `in_progress`

---

### PASSO 12 — Prestador adiciona fotos antes do serviço

> Este endpoint aceita `multipart/form-data`

```http
PATCH /api/orders/ORDER_ID/photos
Authorization: Bearer TOKEN_PROVIDER
Content-Type: multipart/form-data

type: before
photos: [arquivo de imagem]
```

**Resultado esperado:** `200 OK` com `beforePhotos` preenchido

---

### PASSO 13 — Prestador finaliza o serviço

```http
PATCH /api/orders/ORDER_ID/status
Authorization: Bearer TOKEN_PROVIDER
Content-Type: application/json

{
  "status": "waiting_approval"
}
```

**Resultado esperado:** `200 OK`, status = `waiting_approval`

---

### PASSO 14 — Cliente aprova a conclusão

```http
PATCH /api/orders/ORDER_ID/approve-completion
Authorization: Bearer TOKEN_CLIENT
```

**Resultado esperado:** `200 OK`, status = `completed`, `completedAt` preenchido

Verifique:
- `GET /api/service-requests/REQUEST_ID` → status = `completed`

---

### PASSO 15 — Cliente paga o restante (80%)

```http
POST /api/payments/ORDER_ID/remaining/simulate
Authorization: Bearer TOKEN_CLIENT
```

**Resultado esperado:** `201 Created` com:
```json
{
  "type": "remaining",
  "amount": 280,
  "platformFee": 28,
  "providerAmount": 252,
  "gateway": "simulated",
  "status": "paid"
}
```

---

### PASSO 16 — Cliente avalia o prestador

```http
POST /api/reviews
Authorization: Bearer TOKEN_CLIENT
Content-Type: application/json

{
  "orderId": "ORDER_ID",
  "rating": 5,
  "comment": "Ótimo serviço! Pontual, organizado e deixou tudo limpo.",
  "punctuality": 5,
  "quality": 5,
  "communication": 5,
  "cleanliness": 5
}
```

**Resultado esperado:** `201 Created` com a review

Verifique no perfil do prestador:
```http
GET /api/reviews/provider/PROVIDER_USER_ID
```

---

## Outros endpoints úteis para verificação

### Visão do Admin

```http
GET /api/admin/users
Authorization: Bearer TOKEN_ADMIN
```

```http
GET /api/admin/providers
Authorization: Bearer TOKEN_ADMIN
```

```http
GET /api/admin/orders
Authorization: Bearer TOKEN_ADMIN
```

```http
GET /api/admin/payments
Authorization: Bearer TOKEN_ADMIN
```

### Pagamentos do cliente

```http
GET /api/payments/my
Authorization: Bearer TOKEN_CLIENT
```

### Health check (sem token)

```http
GET /api/health
```

---

## Teste de rejeição de orçamento

```http
PATCH /api/quotes/QUOTE_ID/reject
Authorization: Bearer TOKEN_CLIENT
```

---

## Teste de disputa

```http
POST /api/disputes
Authorization: Bearer TOKEN_CLIENT
Content-Type: application/json

{
  "orderId": "ORDER_ID",
  "reason": "Serviço não foi concluído conforme combinado",
  "description": "O prestador não instalou todas as tomadas acordadas."
}
```

```http
PATCH /api/admin/disputes/DISPUTE_ID/status
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json

{
  "status": "resolved_client",
  "adminNotes": "Após análise, o cliente tem razão. Reembolso aprovado."
}
```

---

## Registro de novos usuários (opcional)

### Novo cliente

```http
POST /api/auth/register/client
Content-Type: application/json

{
  "name": "Ana Silva",
  "email": "ana@email.com",
  "password": "senha123",
  "phone": "(11) 99999-0000",
  "city": "São Paulo",
  "state": "SP"
}
```

### Novo prestador (pendente de aprovação)

```http
POST /api/auth/register/provider
Content-Type: application/json

{
  "name": "Carlos Técnico",
  "email": "carlos@email.com",
  "password": "senha123",
  "phone": "(11) 98888-0000",
  "city": "São Paulo",
  "state": "SP",
  "professionalName": "Carlos Técnico",
  "document": "000.000.000-00",
  "categories": ["CATEGORY_ID"],
  "cities": ["São Paulo"]
}
```

### Aprovar prestador via admin

```http
PATCH /api/admin/providers/PROVIDER_PROFILE_ID/approve
Authorization: Bearer TOKEN_ADMIN
```

---

## Dicas

- Todos os tokens expiram em 7 dias por padrão
- O banco em memória é **resetado** a cada reinicialização do servidor
- Para persistir dados entre reinicializações, configure um MongoDB Atlas e use `npm run dev`
- Os IDs de ObjectId devem ser copiados dos responses — são gerados automaticamente pelo MongoDB
