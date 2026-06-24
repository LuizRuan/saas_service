# MãoCerta — Backend

API REST do marketplace de prestadores de serviço locais.

## Stack

- Node.js + Express + TypeScript
- MongoDB Atlas + Mongoose
- JWT para autenticação
- bcryptjs para hash de senhas

## Configuração

```bash
cd backend
npm install
cp .env.example .env
# Preencha MONGODB_URI e JWT_SECRET no .env
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor em modo desenvolvimento (hot reload) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Executa a build compilada |
| `npm run seed` | Executa os seeds manualmente |
| `npm run typecheck` | Verifica tipos sem compilar |

> Os seeds (admin + categorias) também rodam automaticamente ao iniciar o servidor se os dados ainda não existirem.

## Rotas disponíveis (Etapa 1)

```
POST   /api/auth/register/client     Cadastro de cliente
POST   /api/auth/register/provider   Cadastro de prestador
POST   /api/auth/login               Login
GET    /api/auth/me                  Dados do usuário autenticado
GET    /api/categories               Lista de categorias ativas
GET    /health                       Health check
```

## Estrutura

```
src/
├── config/         Banco de dados e variáveis de ambiente
├── controllers/    Handlers HTTP (recebem req/res)
├── middlewares/    Auth JWT, roles, erros globais
├── models/         Schemas Mongoose tipados
├── routes/         Definição das rotas Express
├── seeds/          Dados iniciais (admin, categorias)
├── services/       Lógica de negócio
├── types/          Tipos globais + augmentação do Express
└── utils/          JWT e bcrypt helpers
```

## Credenciais padrão (desenvolvimento)

- **Admin:** admin@maocerta.com.br / Admin@123456

## Próximas etapas

- Etapa 2: Frontend React/Vite/Tailwind — Landing page, autenticação, dashboards
- Etapa 3: Upload de fotos (Cloudinary)
- Etapa 4: Fluxo de solicitações, orçamentos e ordens de serviço
- Etapa 5: Pagamento simulado + estrutura para gateway real
