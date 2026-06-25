# Guia de Deploy — MãoCerta

## Visão Geral

| Serviço | Plataforma | Observações |
|---------|-----------|-------------|
| **Backend (API)** | Render | Node.js, `npm run render-build` |
| **Frontend (SPA)** | Vercel | React/Vite, `npm run build` |
| **Database** | MongoDB Atlas | Cluster compartilhado ou dedicado |

---

## 1. Banco de Dados — MongoDB Atlas

1. Crie um cluster em [cloud.mongodb.com](https://cloud.mongodb.com/)
2. Em **Database Access**, crie um usuário com senha forte
3. Em **Network Access**, adicione os IPs do Render (ou `0.0.0.0/0` para início)
4. Copie a **Connection String** (formato: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)

---

## 2. Backend — Render

### Criar o serviço

1. Acesse [render.com](https://render.com/) → **New Web Service**
2. Conecte o repositório GitHub
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm run render-build`
   - **Start Command:** `npm start`
   - **Node Version:** 18+

### Variáveis de ambiente obrigatórias

| Variável | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3333` (Render injeta automaticamente) |
| `MONGODB_URI` | String de conexão do Atlas |
| `JWT_SECRET` | String aleatória forte (ex: `openssl rand -base64 64`) |
| `ADMIN_EMAIL` | Email do administrador |
| `ADMIN_PASSWORD` | Senha forte do admin (mín. 12 chars) |
| `ADMIN_NAME` | Nome do administrador |
| `FRONTEND_URL` | URL do deploy no Vercel (ex: `https://maocerta.vercel.app`) |
| `DEPOSIT_PERCENT` | `20` (porcentagem do sinal) |
| `PLATFORM_FEE_PERCENT` | `10` (taxa da plataforma) |

### Após o deploy

Anote a URL gerada pelo Render (ex: `https://maocerta-api.onrender.com`).

### Seed de produção

```bash
# No painel do Render → Shell, ou localmente com as env vars corretas:
npm run seed:prod
```

---

## 3. Frontend — Vercel

### Criar o projeto

1. Acesse [vercel.com](https://vercel.com/) → **New Project**
2. Importe o repositório GitHub
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Variáveis de ambiente

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | URL do backend no Render + `/api` (ex: `https://maocerta-api.onrender.com/api`) |

### Após o deploy

Copie a URL do Vercel (ex: `https://maocerta.vercel.app`) e adicione como `FRONTEND_URL` no backend do Render.

---

## 4. Ordem de Deploy

```
1. MongoDB Atlas    → Criar cluster e obter connection string
2. Backend (Render) → Deploy com MONGODB_URI
3. Seed de produção → npm run seed:prod (insere categorias + admin)
4. Frontend (Vercel) → Deploy com VITE_API_URL apontando para o Render
5. Backend (Render)  → Atualizar FRONTEND_URL com a URL do Vercel e re-deploy
```

---

## 5. Verificação Pós-Deploy

```bash
# Health check do backend
curl https://maocerta-api.onrender.com/api/health

# Deve retornar:
# { "success": true, "message": "MãoCerta API está funcionando!" }
```

- Acesse o frontend no Vercel e teste login/registro
- Verifique logs no Render para erros de conexão
- Confirme que CORS está bloqueando origens desconhecidas

---

## 6. Segurança Checklist Pré-Deploy

- [ ] `JWT_SECRET` gerado aleatoriamente (não o default)
- [ ] `ADMIN_PASSWORD` forte e não pública
- [ ] `NODE_ENV=production` configurado
- [ ] `MONGODB_URI` com usuário dedicado (não root)
- [ ] `FRONTEND_URL` configurado com a URL exata do Vercel
- [ ] Seed demo NÃO executado em produção (use `seed:prod`)
- [ ] Network Access do Atlas restrito aos IPs do Render

---

## 7. Troubleshooting

### Backend não conecta ao MongoDB
- Verifique `MONGODB_URI` no painel do Render
- Confirme que o IP do Render está liberado no Atlas Network Access

### CORS bloqueando requisições do frontend
- Confirme que `FRONTEND_URL` no backend é exatamente a URL do Vercel (com `https://`)
- Sem trailing slash

### Porta 3333 vs variável de ambiente
O Render injeta a variável `PORT` automaticamente. O código lê `process.env.PORT || 3333`, então funciona sem configuração manual.

### Deploy falha no Render
- Verifique se o `render-build` script está correto: `npm install --include=dev && tsc`
- Erros de TypeScript bloqueiam o build — rode `npm run typecheck` localmente antes
