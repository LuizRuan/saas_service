# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**MãoCerta** — marketplace SaaS for local service providers (Brazil). Monorepo with two independent sub-projects: `backend/` and `frontend/`.

## Commands

### Backend (`cd backend`)

```bash
npm run dev        # Development server with hot reload (ts-node + nodemon)
npm run build      # Compile TypeScript to dist/
npm start          # Run compiled build
npm run seed       # Run seeds manually (admin + categories)
npm run typecheck  # Type-check without emitting
```

### Frontend (`cd frontend`)

```bash
npm run dev        # Vite dev server (http://localhost:5173)
npm run build      # tsc + vite build
npm run lint       # oxlint
npm run preview    # Preview production build
```

## Environment setup

**Backend** — copy `.env.example` to `.env` and fill in:
- `MONGODB_URI` — MongoDB Atlas connection string (required)
- `JWT_SECRET` — JWT signing secret (required)
- `CORS_ORIGIN` — defaults to `http://localhost:5173`

**Frontend** — copy `.env.example` to `.env`:
- `VITE_API_URL` — defaults to `http://localhost:3001/api`

Default dev admin credentials: `admin@maocerta.com.br` / `Admin@123456`

Seeds (admin + categories) run **automatically on server start** if data doesn't exist — `npm run seed` is only needed to force a re-run.

## Architecture

### Backend

**Stack:** Express + TypeScript + MongoDB/Mongoose + JWT + bcryptjs. Runs on port 3001.

**Layer structure:**
- `config/` — `env.ts` validates and exports all env vars at startup; `database.ts` connects Mongoose
- `controllers/` — HTTP layer only (parse req, call service, send response)
- `services/` — all business logic (validation, DB queries, token generation)
- `middlewares/` — `authenticate` (JWT verification, attaches `req.user`), `authorize(...roles)` (RBAC), `globalErrorHandler` + `notFoundHandler`
- `models/` — Mongoose schemas with TypeScript interfaces
- `routes/` — wire controllers to Express router
- `seeds/` — idempotent seeders for admin user and service categories
- `utils/` — `jwt.ts` (sign/verify), `password.ts` (bcrypt hash/compare)
- `types/index.ts` — shared type aliases (`UserRole`, `OrderStatus`, etc.) and `JwtPayload` / `ApiResponse<T>` interfaces

**API response envelope** — all responses follow `{ success: boolean, data?: T, error?: string, code?: string }`. Throw `AppError(message, statusCode, code)` from services/controllers to produce structured error responses.

**Auth flow:** `POST /api/auth/login` → JWT returned → stored in `localStorage` as `maocerta:token` → sent as `Authorization: Bearer <token>` on all subsequent requests → 401 response clears token and redirects to `/login`.

**Rate limiting:** 100 requests per 15 minutes per IP (applied globally in `app.ts`).

### Frontend

**Stack:** React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router v7 + Axios + react-hook-form + Zod + recharts.

**Key architectural decisions:**

- `src/services/api.ts` — central Axios instance. **Response interceptor automatically unwraps** the `{ success, data }` envelope, so service functions receive the inner `data` directly. On 401, clears token and hard-redirects to `/login`.
- `src/contexts/AuthContext.tsx` — global auth state (user, token, isLoading). `login()` stores the token and navigates to the role-appropriate dashboard. Wrap pages with `useAuth()` to access auth state.
- `src/router/index.tsx` — `AuthProvider` wraps the entire router via `AuthWrapper`. `ProtectedRoute` guards role-specific subtrees by checking `user.role` against `allowedRoles`.
- `src/components/ui/` — custom UI primitives (Button, Input, Card, Badge, etc.). Use these instead of raw HTML elements for consistency.
- `src/utils/storage.ts` — thin wrapper over `localStorage` for the JWT token (key: `maocerta:token`).

**Route structure by role:**
- Public: `/`, `/buscar`, `/categoria/:slug`, `/prestador/:id`, `/login`, `/cadastro/cliente`, `/cadastro/prestador`
- Client (role `client`): `/cliente/*`
- Provider (role `provider`): `/prestador/*`
- Admin (role `admin`): `/admin/*`

Pages marked `<ComingSoon>` are placeholders for future implementation stages.

### Data model relationships

- `User` (role: `client | provider | admin`) — core identity document
- `ProviderProfile` — 1:1 with `User` (linked via `userId`), created atomically during provider registration. Status starts as `pending` (requires admin approval). Has `plan: free | pro | business | premium`.
- `Category` — service categories with `slug`; populated at seed time
- `ServiceRequest` → `Quote` → `Order` → `Payment` — the main service fulfilment pipeline (schemas exist, controllers/routes pending)
- `Review` and `Dispute` — end-of-service documents

### Planned features (not yet implemented)

- Etapa 3: Cloudinary image upload (`CLOUDINARY_*` env vars ready)
- Etapa 4: Full service request / quote / order flow
- Etapa 5: Payment gateway (Asaas / Mercado Pago — `PAYMENT_GATEWAY`, `ASAAS_API_KEY`, `MP_ACCESS_TOKEN` env vars ready)
