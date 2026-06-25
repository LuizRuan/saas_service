# MãoCerta — Backend

API REST para a plataforma MãoCerta, um marketplace brasileiro de contratação de prestadores de serviço locais.

## Stack

- **Node.js** + **Express**
- **TypeScript**
- **MongoDB Atlas** + **Mongoose**
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Zod** para validações (futuro)

## Estrutura

```
backend/
├── src/
│   ├── config/          # Configurações (env, database)
│   ├── controllers/     # Controllers das rotas
│   ├── middlewares/      # Middlewares (auth, error, authorize)
│   ├── models/           # Models Mongoose
│   ├── routes/           # Definição de rotas
│   ├── services/         # Lógica de negócio
│   ├── seeds/            # Seeds (categorias, admin)
│   ├── utils/            # Utilitários (errors, response)
│   ├── types/            # Types TypeScript
│   ├── app.ts            # Configuração do Express
│   └── server.ts         # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## Como rodar

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env com suas credenciais MongoDB Atlas e demais configs
```

### 3. Rodar seed (categorias + admin)

```bash
npm run seed
```

### 4. Iniciar em desenvolvimento

```bash
npm run dev
```

### 5. Build para produção

```bash
npm run build
npm start
```

## Rotas disponíveis (Etapa 1)

| Método | Rota                           | Descrição                     | Auth |
| ------ | ------------------------------ | ----------------------------- | ---- |
| GET    | /api/health                    | Health check                  | ❌    |
| POST   | /api/auth/register/client      | Registrar cliente             | ❌    |
| POST   | /api/auth/register/provider    | Registrar prestador           | ❌    |
| POST   | /api/auth/login                | Login                         | ❌    |
| GET    | /api/auth/me                   | Dados do usuário autenticado  | ✅    |
| GET    | /api/categories                | Listar categorias ativas      | ❌    |
| GET    | /api/categories/:slug          | Buscar categoria por slug     | ❌    |

## Categorias iniciais (seed)

- Pintor
- Eletricista
- Encanador
- Técnico de Ar-condicionado
- Técnico de Câmeras/Segurança
- Montador de Móveis
