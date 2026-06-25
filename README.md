# 🔧 MãoCerta — Marketplace de Prestadores de Serviço

> Plataforma SaaS brasileira que conecta clientes a prestadores de serviço qualificados em suas regiões.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-blue)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

---

## 📖 Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológico](#stack-tecnológico)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Setup Local](#setup-local)
- [Rodando a Aplicação](#rodando-a-aplicação)
- [Funcionalidades](#funcionalidades)
- [API Reference](#api-reference)
- [Contribuindo](#contribuindo)

---

## 🎯 Visão Geral

MãoCerta é uma plataforma de **two-sided marketplace** que:

✅ Permite **clientes** criar solicitações de serviço  
✅ Conecta com **prestadores** qualificados na região  
✅ Gerencia **orçamentos**, **pagamentos** e **contratos**  
✅ Oferece **sistema de avaliações** e **disputas**  
✅ Fornece **dashboard administrativo** completo  

### Atores do Sistema

| Ator | Função |
|------|--------|
| **Cliente** | Cria solicitações, recebe orçamentos, aprova serviços, paga |
| **Prestador** | Visualiza solicitações, envia orçamentos, executa serviços |
| **Admin** | Gerencia usuários, categorias, disputas, estatísticas |

---

## 🛠️ Stack Tecnológico

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 4.21
- **Linguagem:** TypeScript 5.7
- **Database:** MongoDB + Mongoose 8.9
- **Autenticação:** JWT (jsonwebtoken 9.0)
- **Segurança:** bcryptjs, Helmet, CORS
- **Uploads:** Multer (local ou S3)
- **Logging:** Morgan
- **Validação:** Zod (em preparação)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 6
- **Linguagem:** TypeScript 5.6
- **Roteamento:** React Router 6.27
- **HTTP Client:** Axios
- **Estilos:** Tailwind CSS 3.4
- **Animações:** Framer Motion 12.42
- **Ícones:** Lucide React
- **Gráficos:** Recharts 3.9

### DevOps
- **Database em Mem:** MongoDB Memory Server (desenvolvimento)
- **Versionamento:** Git
- **Hospedagem:** Vercel (recomendado)

---

## 📁 Estrutura do Projeto

```
saas_service/
├── backend/                    # API Express + MongoDB
│   ├── src/
│   │   ├── config/             # Variáveis, database
│   │   ├── controllers/        # Lógica das rotas
│   │   ├── models/             # Schemas Mongoose
│   │   ├── services/           # Lógica de negócio
│   │   ├── routes/             # Definição de rotas
│   │   ├── middlewares/        # Auth, erros, validação
│   │   ├── seeds/              # Dados iniciais
│   │   ├── utils/              # Funções utilitárias
│   │   ├── types/              # Tipos TypeScript
│   │   ├── app.ts              # Config Express
│   │   └── server.ts           # Entry point
│   ├── .env.example
│   ├── package.json
│   └── README.md               # Docs detalhado do backend
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── pages/              # Páginas (rotas)
│   │   ├── contexts/           # State global
│   │   ├── services/           # Chamadas de API
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Configurações
│   │   ├── types/              # Tipos TypeScript
│   │   ├── App.tsx             # Router
│   │   └── main.tsx            # Entry point
│   ├── index.html
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── CLAUDE.md                   # 📚 Documentação detalhada do sistema
├── README.md                   # Este arquivo
├── .git/
└── .gitignore
```

---

## 🚀 Setup Local

### Pré-requisitos

- **Node.js 18+**
- **npm 9+** (ou yarn/pnpm)
- **MongoDB Atlas** (conta gratuita) ou usar MongoDB em memória para dev
- **Git**

### 1. Clonar o Repositório

```bash
git clone <seu-repo>
cd saas_service
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de env
cp .env.example .env

# Editar .env com suas credenciais
# Mínimo necessário:
# - MONGODB_URI (ou deixar em branco para usar em-memória)
# - JWT_SECRET
# - FRONTEND_URL

# Inserir dados iniciais (categorias, admin)
npm run seed

# Iniciar em desenvolvimento
npm run dev
```

O backend estará disponível em: **http://localhost:5000**

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Copiar arquivo de env
cp .env.example .env

# (Manter VITE_API_URL=http://localhost:5000)

# Iniciar em desenvolvimento
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

---

## ▶️ Rodando a Aplicação

### Opção 1: Dois Terminais (Recomendado para Dev)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### Opção 2: Build para Produção

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

### Testes de Tipo

```bash
# Backend
cd backend && npm run typecheck

# Frontend
cd frontend && npm run typecheck
```

---

## ✨ Funcionalidades

### 👥 Autenticação & Autorização
- ✅ Registro como Cliente ou Prestador
- ✅ Login com JWT
- ✅ Roles: `client`, `provider`, `admin`
- ✅ Proteção de rotas por role

### 🏢 Solicitações de Serviço
- ✅ Cliente cria solicitação (título, descrição, fotos, orçamento máximo)
- ✅ Prestador visualiza e filtra solicitações disponíveis
- ✅ Status: `open → quoted → scheduled → in_progress → completed`

### 💰 Orçamentos (Quotes)
- ✅ Prestador envia orçamento com valor e descrição
- ✅ Cliente aceita ou rejeita
- ✅ Status: `sent → accepted | rejected | expired`

### 📋 Ordens de Serviço
- ✅ Criada automaticamente ao aceitar quote
- ✅ Rastreamento do progresso
- ✅ Aprovação final do cliente

### 💳 Pagamentos
- ✅ Ciclo: 50% depósito + 50% restante
- ✅ Integração: Mercado Pago, ASAAS, PagarMe
- ✅ Status: `pending → paid | failed | refunded`

### ⭐ Avaliações (Reviews)
- ✅ Cliente avalia prestador (1-5 estrelas)
- ✅ Comentários opcionais

### 🚨 Sistema de Disputas
- ✅ Cliente abre disputa sobre execução
- ✅ Admin revisa e resolve
- ✅ Reembolso automático se necessário

### 🎛️ Dashboard Admin
- ✅ Estatísticas gerais (usuários, ordens, receita)
- ✅ Gerenciamento de disputas
- ✅ Bloqueio de usuários

### 📊 Categorias de Serviço
- ✅ Pintor
- ✅ Eletricista
- ✅ Encanador
- ✅ Técnico de Ar-condicionado
- ✅ Técnico de Câmeras/Segurança
- ✅ Montador de Móveis
- ✅ (Extensível)

---

## 📡 API Reference

### Endpoints Principais

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/health` | Health check | ❌ |
| POST | `/api/auth/register/client` | Registrar cliente | ❌ |
| POST | `/api/auth/register/provider` | Registrar prestador | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | Dados do usuário | ✅ |
| GET | `/api/categories` | Listar categorias | ❌ |
| GET | `/api/service-requests` | Listar solicitações | ❌ |
| POST | `/api/service-requests` | Criar solicitação | ✅ (client) |
| POST | `/api/quotes` | Enviar orçamento | ✅ (provider) |
| PUT | `/api/quotes/:id` | Aceitar/Rejeitar | ✅ (client) |
| GET | `/api/orders` | Minhas ordens | ✅ |
| POST | `/api/payments` | Processar pagamento | ✅ |
| POST | `/api/reviews` | Deixar avaliação | ✅ |
| POST | `/api/disputes` | Abrir disputa | ✅ |

**Ver documentação detalhada em:** [`backend/README.md`](backend/README.md)

---

## 🔐 Segurança

- 🔒 **Senhas:** bcryptjs com salt automático
- 🔐 **JWT:** Token com payload `userId` e `role`
- 🛡️ **Headers:** Helmet para proteção HTTP
- 🌐 **CORS:** Whitelist de origens
- 🚫 **Validação:** Sanitização de inputs
- 👮 **Autorização:** Middleware de role-based access

---

## 📝 Variáveis de Ambiente

### Backend (`.env`)

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=seu-super-secret-key-aqui
USE_MEMORY_DB=false
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

## 🤝 Contribuindo

### Workflow de Desenvolvimento

1. **Crie uma feature branch**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. **Implemente com TypeScript**
   - Backend: Controllers → Services → Models
   - Frontend: Pages → Components → Services

3. **Teste tipos**
   ```bash
   npm run typecheck
   ```

4. **Commit e push**
   ```bash
   git add .
   git commit -m "feat: descrição da mudança"
   git push origin feature/nova-funcionalidade
   ```

5. **Abra um Pull Request**

### Padrões de Código

- ✅ **TypeScript obrigatório** (sem `any`)
- ✅ **Responses padrão** (`ApiResponse<T>`)
- ✅ **Error handling** com tipos
- ✅ **Nomes em inglês** (código)
- ✅ **Comentários em português** (quando necessário)

---

## 📋 Checklist de Deploy

- [ ] `npm run typecheck` sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Seed executado (backend)
- [ ] Testes locais passando
- [ ] Build sem warnings
- [ ] `.env` não commitado

---

## 📚 Documentação Adicional

- **[CLAUDE.md](CLAUDE.md)** — Documentação detalhada do sistema
- **[backend/README.md](backend/README.md)** — Guia específico do backend
- **[backend/docs/API_TEST_FLOW.md](backend/docs/API_TEST_FLOW.md)** — Fluxo de testes

---

## 🐛 Troubleshooting

### "MongoDB connection refused"
```bash
# Use banco em memória para dev local
npm run dev:memory
```

### "Port 5000 already in use"
```bash
# Mude a porta no .env
PORT=5001
```

### "CORS error"
- Verifique `FRONTEND_URL` no backend `.env`
- Certifique-se que frontend está no whitelist

### "TypeScript errors"
```bash
npm run typecheck
# Corrija os tipos reportados
```

---

## 📞 Suporte

**Desenvolvedor:** Ruan  
**Email:** ruanuchiha77@gmail.com  
**Projeto:** MãoCerta v0.9

---

## 📄 Licença

ISC — Veja [LICENSE](LICENSE) para mais detalhes.

---

## 🚀 Roadmap Futuro

- [ ] Notificações em tempo real (WebSocket)
- [ ] Geolocalização avançada
- [ ] Sistema de chat entre usuários
- [ ] Integração de pagamento completa (Mercado Pago, ASAAS)
- [ ] Recomendações com IA
- [ ] Testes automatizados (Jest, Vitest)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Aplicativo móvel (React Native)

---

**Última atualização:** 25 de junho de 2026  
**Versão:** 0.9
