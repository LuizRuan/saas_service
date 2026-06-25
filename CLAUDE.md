# MãoCerta — Documentação do Projeto

> **Última atualização:** 25 de junho de 2026

## 📋 Visão Geral

**MãoCerta** é uma plataforma SaaS brasileira de **marketplace de prestadores de serviço locais**. Um sistema que conecta **clientes** que precisam de serviços com **prestadores** qualificados em suas regiões.

### Stack Principal
- **Backend:** Node.js + Express + TypeScript
- **Frontend:** React 18 + Vite + TypeScript
- **Database:** MongoDB + Mongoose
- **Autenticação:** JWT
- **Segurança:** bcryptjs para hash de senhas, Helmet para headers seguros
- **Validação:** Zod (preparado para futuro)
- **Estilos:** Tailwind CSS + Framer Motion (animações)

---

## 🏗️ Arquitetura do Sistema

### Backend (`backend/`)

#### Estrutura de Diretórios
```
backend/src/
├── config/           # Configuração (env, database connection)
├── controllers/      # Controllers — lógica das rotas
├── models/           # Schemas MongoDB com Mongoose
├── services/         # Lógica de negócio
├── middlewares/      # Auth, error handling, authorization
├── routes/           # Definição de rotas
├── seeds/            # Dados iniciais (categorias, admin)
├── utils/            # Utilitários (erros, resposta padrão, upload)
├── types/            # Tipos TypeScript (roles, statuses)
├── app.ts            # Configuração Express
└── server.ts         # Entry point
```

#### Controllers Disponíveis
| Controller | Responsabilidade |
|-----------|-----------------|
| `auth.controller.ts` | Registro, login, dados de usuário |
| `serviceRequest.controller.ts` | Criar/listar/atualizar solicitações de serviço |
| `quote.controller.ts` | Orçamentos enviados por prestadores |
| `order.controller.ts` | Ordens de serviço criadas após aceitação de orçamento |
| `payment.controller.ts` | Processamento e rastreamento de pagamentos |
| `review.controller.ts` | Avaliações de serviços (1-5 estrelas) |
| `dispute.controller.ts` | Sistema de disputas/reclamações |
| `admin.controller.ts` | Dashboard de admin, estatísticas |
| `provider.controller.ts` | Gerenciamento de perfil do prestador |
| `category.controller.ts` | Categorias de serviço |

#### Models (MongoDB)
1. **User**
   - `name`, `email`, `passwordHash`, `phone`
   - `role` (client/provider/admin)
   - `city`, `state` (localização)
   - `status` (active/blocked)
   - `createdAt`, `updatedAt`

2. **ServiceRequest**
   - Criada por cliente quando precisa de um serviço
   - Campos: título, descrição, categoria, localização, fotos, orçamento máximo
   - Status: `open → quoted → scheduled → in_progress → completed`
   - Urgência: `low | medium | high`

3. **Quote**
   - Orçamento enviado por prestador para uma solicitação
   - Campos: valor, descrição, tempo estimado
   - Status: `sent → accepted | rejected | expired`

4. **Order**
   - Criada quando cliente aceita um quote
   - Rastreia execução do serviço
   - Status: `created → scheduled → in_progress → completed`

5. **Payment**
   - Rastreia transações
   - Suporta múltiplos gateways: simulated, Mercado Pago, ASAAS, PagarMe
   - Tipos: `deposit` (50%), `remaining` (50%), `full` (100%)
   - Status: `pending → paid | refunded | failed`

6. **Review**
   - Avaliação do serviço (1-5 estrelas)
   - Associada a uma Order após conclusão

7. **Dispute**
   - Reclamação sobre um serviço
   - Status: `open → under_review → resolved_client | resolved_provider | refunded`

8. **ProviderProfile**
   - Perfil expandido do prestador
   - Campos: `plan` (free/pro/business/premium), status, especialidades, avaliação média

9. **Category**
   - Categorias de serviço
   - Seed inicial: Pintor, Eletricista, Encanador, etc.

#### Middlewares
- **auth.ts** — Verifica JWT, popula `req.user`
- **authorize.ts** — Verifica roles (client/provider/admin)
- **errorHandler.ts** — Captura erros globais
- **index.ts** — Exporta middleware

#### Variáveis de Ambiente (`.env`)
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://...
JWT_SECRET=seu-secret-aqui
USE_MEMORY_DB=false  # true para dev local sem MongoDB
```

**Suportado:** MongoDB em memória (`mongodb-memory-server`) para testes locais.

#### Database Connection
- Automático: Conecta ao MongoDB Atlas ou usa em-memória se credenciais estiverem em placeholder

#### Rotas da API
```
/api/
├── /auth
│   ├── POST /register/client
│   ├── POST /register/provider
│   ├── POST /login
│   └── GET /me (autenticado)
├── /categories
│   ├── GET / (listar)
│   └── GET /:slug (detalhe)
├── /service-requests
│   ├── GET / (listadas publicamente)
│   ├── POST / (criar — client autenticado)
│   ├── GET /:id (detalhe)
│   └── PUT /:id (atualizar — owner/admin)
├── /quotes
│   ├── GET / (minhas solicitações — prestador)
│   ├── POST / (enviar orçamento — prestador)
│   ├── GET /:id
│   └── PUT /:id (aceitar/rejeitar — cliente)
├── /orders
│   ├── GET / (minhas ordens)
│   ├── GET /:id
│   └── PUT /:id (atualizar status)
├── /payments
│   ├── POST / (processar pagamento)
│   └── GET /:id (status)
├── /reviews
│   ├── POST / (criar avaliação)
│   └── GET /provider/:id (reviews do prestador)
├── /disputes
│   ├── POST / (abrir disputa)
│   ├── GET /:id
│   └── PUT /:id (resolver — admin)
├── /providers
│   ├── GET / (listar prestadores)
│   ├── GET /:id (detalhe)
│   └── PUT /:id (atualizar perfil — owner)
├── /admin
│   ├── GET /dashboard (estatísticas)
│   └── GET /users (listar usuários)
└── /health (GET — health check)
```

#### Setup para Rodagem
```bash
cd backend
npm install
cp .env.example .env
# Edite .env com suas credenciais
npm run dev              # Inicia em localhost:5000
# OU
npm run dev:memory       # Com MongoDB em memória
```

---

### Frontend (`frontend/`)

#### Estrutura de Diretórios
```
frontend/src/
├── components/
│   ├── layout/          # PublicLayout, DashboardLayout, ProtectedRoute
│   └── shared/          # RoleRedirect, componentes reutilizáveis
├── pages/
│   ├── auth/            # LoginPage, RegisterPage
│   ├── public/          # LandingPage
│   ├── client/          # Cliente: Dashboard, Explore, Requests, Orders
│   ├── provider/        # Prestador: Dashboard, Available, Quotes
│   └── admin/           # Admin: Dashboard
├── contexts/
│   └── AuthContext.tsx  # Context global de autenticação
├── services/            # Chamadas de API (axios)
├── hooks/               # Custom hooks (useAuth)
├── lib/                 # Utilitários (axios config, utils)
├── types/               # Tipos TypeScript
├── App.tsx              # Router principal
└── main.tsx             # Entry point
```

#### Pages do Sistema

**Públicas** (sem autenticação)
- `/` — Landing page
- `/login` — Login
- `/cadastro` — Registro

**Cliente** (role: `client`)
- `/cliente` — Dashboard (minhas solicitações, estatísticas)
- `/cliente/explorar` — Explorar prestadores/serviços
- `/cliente/solicitacoes` — Minhas solicitações
- `/cliente/solicitacoes/nova` — Criar nova solicitação
- `/cliente/solicitacoes/:id` — Detalhe da solicitação
- `/cliente/ordens` — Minhas ordens de serviço

**Prestador** (role: `provider`)
- `/prestador` — Dashboard (minhas estatísticas, quote recebidas)
- `/prestador/pedidos` — Solicitações disponíveis
- `/prestador/pedidos/:id` — Detalhe da solicitação (enviar orçamento)
- `/prestador/orcamentos` — Meus orçamentos

**Admin** (role: `admin`)
- `/admin` — Dashboard com estatísticas gerais

#### Autenticação
- **AuthContext.tsx** — Gerencia estado de autenticação global
- Armazena `token`, `user`, `role`
- `useAuth()` hook expõe: `login()`, `logout()`, `isAuthenticated`, `user`
- Proteção de rotas com `<ProtectedRoute roles={['client']}>` 
- Redirecionamento automático de usuários logados com `<RoleRedirect />`

#### Services (API Calls)
- `auth.service.ts` — Login, registro, dados do usuário
- `serviceRequest.service.ts` — CRUD de solicitações
- `quote.service.ts` — CRUD de orçamentos
- `order.service.ts` — CRUD de ordens
- `payment.service.ts` — Processamento de pagamentos
- `admin.service.ts` — Dados administrativos
- `category.service.ts` — Listar categorias
- `provider.service.ts` — Perfil de prestador

#### Estilo
- **Tailwind CSS** — Utility-first CSS framework
- **Framer Motion** — Animações suaves
- **Lucide React** — Ícones SVG
- **Recharts** — Gráficos (dashboards)

#### Setup para Rodagem
```bash
cd frontend
npm install
npm run dev              # Inicia em localhost:5173
```

---

## 🔐 Fluxo de Autenticação

1. **Registro:**
   - Cliente ou prestador preenche formulário
   - Backend cria usuário com `passwordHash`
   - Retorna JWT token

2. **Login:**
   - Usuário envia email + senha
   - Backend valida com bcryptjs
   - Retorna JWT token + dados do usuário

3. **Token Storage:**
   - Frontend armazena em `localStorage` (ou sessionStorage)
   - Axios interceptor adiciona header `Authorization: Bearer <token>`

4. **Proteção de Rotas:**
   - `ProtectedRoute` verifica token no localStorage
   - Redireciona para `/login` se ausente ou inválido

---

## 💼 Fluxo de Negócio (Cliente → Prestador → Ordem → Pagamento)

### Fluxo Simplificado

```
1. Cliente cria ServiceRequest
   ↓
2. Prestador vê solicitação em "Pedidos Disponíveis"
   ↓
3. Prestador envia Quote (orçamento)
   ↓
4. Cliente aceita Quote
   → Cria Order
   ↓
5. Prestador inicia trabalho
   ↓
6. Cliente aprova conclusão (waiting_approval → completed)
   ↓
7. Sistema processa pagamento
   ↓
8. Cliente deixa Review (opcional)
   ↓
9. Disputa (se necessário)
```

### Statuses

**ServiceRequest:**
```
open → quoted → scheduled → in_progress → completed
                                    ↓
                              waiting_approval
```

**Quote:**
```
sent → accepted (cria Order)
   ↘ rejected
   ↘ expired
```

**Order:**
```
created → scheduled → in_progress → completed
                      ↓
                waiting_approval
```

**Payment:**
- **Ciclo:** pending → paid (ou failed/refunded)
- **Tipos:** 50% depósito + 50% restante, ou 100% upfront

---

## 🚀 Como Executar

### Backend
```bash
cd backend
npm install
npm run dev              # Dev em localhost:5000
npm run build            # Build TypeScript
npm start                # Roda dist/server.js
npm run seed             # Insere categorias + admin
```

### Frontend
```bash
cd frontend
npm install
npm run dev              # Vite em localhost:5173
npm run build            # Build otimizado
npm run typecheck        # Verifica tipos
```

### Simultaneamente
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## 📝 Variáveis de Ambiente

### Backend (`.env`)
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=seu-jwt-secret-super-secreto
USE_MEMORY_DB=false
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🧪 Testes e Validação

### Backend
- **TypeScript** — Checagem de tipos
- **Middleware de erro** — Trata exceções globalmente
- **Validação de entrada** — Zod (em implementação)

### Frontend
- **TypeScript** — Tipagem completa
- **React Router** — Validação de acesso a rotas

---

## 📊 Status Atual (v0.9)

### ✅ Implementado
- ✅ Autenticação JWT (login, registro)
- ✅ Roles: cliente, prestador, admin
- ✅ Categorias de serviço (seed)
- ✅ Solicitações de serviço (CRUD)
- ✅ Orçamentos/Quotes (CRUD)
- ✅ Ordens (CRUD)
- ✅ Pagamentos (estrutura + integração Mercado Pago/ASAAS/PagarMe)
- ✅ Reviews (avaliações)
- ✅ Disputas (sistema de reclamações)
- ✅ Upload de fotos
- ✅ Dashboard admin
- ✅ Perfil de prestador
- ✅ Frontend React com Vite
- ✅ Rotas protegidas por role
- ✅ Context API para autenticação
- ✅ Estilo Tailwind CSS

### 🔄 Em Progresso
- 🔄 Integração completa de pagamentos (gateways)
- 🔄 Notificações em tempo real (WebSocket)
- 🔄 Geolocalização avançada

### ❌ Não Implementado
- ❌ Testes unitários (Jest/Vitest)
- ❌ Testes E2E
- ❌ CI/CD pipeline
- ❌ Alertas e notificações por email/SMS
- ❌ Busca avançada com filtros
- ❌ Recomendações com IA

---

## 🛠️ Tecnologias Adicionais

| Tecnologia | Propósito |
|-----------|----------|
| **Helmet** | Segurança HTTP (headers) |
| **CORS** | Controle de origem |
| **Morgan** | Logging de requisições |
| **Multer** | Upload de arquivos |
| **bcryptjs** | Hash de senhas |
| **Zod** | Validação de schemas |
| **Framer Motion** | Animações React |
| **Recharts** | Gráficos nos dashboards |
| **Lucide React** | Ícones |
| **Axios** | HTTP client |

---

## 📱 Responsividade e UX

- Layout adaptativo com Tailwind
- Temas de cor consistentes
- Animações suaves com Framer Motion
- Componentes reutilizáveis
- Feedback visual (loading, errors, success)

---

## 🔒 Segurança

1. **Senhas** — bcryptjs com salt
2. **JWT** — Token com expiração
3. **Headers** — Helmet configurado
4. **CORS** — Whitelist de origens
5. **Inputs** — Sanitização de strings
6. **Roles** — Middleware de autorização

---

## 📖 Commits Recentes

```
97ceb15 Atualização 0.9
3caffb5 Atualização 0.8
3081254 Atualização 0.7
027be37 Atualização 0.6
62aaf9a Atualização 0.5
a8c62dd Atualização 0.4
f0c8319 fix: remove moduleResolution explicito do tsconfig (fix Render build)
e79c53d Atualização 0.3
be91a99 Atualização 0.2
40e1b89 atualização 0.1
b79d5fe feat: Etapas 1 e 2 — backend auth/categories + frontend React/Vite
```

---

## 📝 Notas para Desenvolvimento

### Quando Adicionar Nova Feature

1. **Define type** em `backend/src/types/index.ts`
2. **Cria Model** em `backend/src/models/`
3. **Cria Service** com lógica de negócio
4. **Cria Controller** que chama Service
5. **Define Routes** em `backend/src/routes/`
6. **Frontend:** Cria Service de API + Pages/Components
7. **Testa:** Manual no frontend + verificação de types

### Padrões de Código

- **Controllers:** Chamam services, retornam resposta padrão
- **Services:** Contêm lógica, não interagem com HTTP
- **Middlewares:** Validação, autenticação, erro
- **Models:** Apenas schema Mongoose
- **Types:** Tipos compartilhados backend/frontend

### Pasta de Uploads

- Local: `backend/uploads/` (MVP)
- Production: Considerar S3/CloudStorage
- Endpoint: `/uploads/:filename`

---

## 🤝 Contribuindo

1. Sempre use TypeScript
2. Mantenha tipos explícitos
3. Siga padrão de Response (`ApiResponse<T>`)
4. Trate erros com `AppError`
5. Valide entradas (Zod quando possível)

---

## 📞 Contato e Suporte

**Desenvolvedor:** Ruan  
**Email:** ruanuchiha77@gmail.com  
**Projeto:** MãoCerta v0.9  
**Repositório:** GitHub (monorepo backend + frontend)

---

**Documento gerado automaticamente — Última revisão: 25 de junho de 2026**
