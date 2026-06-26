# Admin Usuários — Bloqueio, Exclusão e Histórico

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar ao painel admin capacidade de bloquear usuários por tempo determinado, excluir usuários (soft delete) e visualizar histórico de ações por usuário, com proteção contra bloqueio/exclusão do próprio admin logado ou do último admin ativo.

**Architecture:** Backend — 1 novo model (AuditLog), 5 arquivos modificados (User model, types, admin service, admin controller, admin routes, auth service). Frontend — 2 arquivos modificados (admin.service.ts, UsersPage.tsx). Modais de bloqueio, exclusão e histórico ficam inline em UsersPage.tsx. Sem novos arquivos de página.

**Tech Stack:** Node.js + Express + TypeScript + MongoDB/Mongoose (backend); React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion + Lucide React (frontend)

## Global Constraints

- NO commits automáticos — o usuário commita manualmente
- NUNCA retornar `passwordHash` (já protegido por `select: false` — não alterar isso)
- Soft delete: `status: 'deleted'` + `deletedAt` + `deletedBy` — nunca excluir documentos do banco
- Não bloquear/excluir o próprio admin logado (verificar `targetId === adminId` no backend)
- Não bloquear o último admin ativo; não excluir o único admin restante (qualquer status)
- `getMe` e `login` verificam `blockedUntil`: se expirado, auto-reativar e limpar campos de bloqueio
- `status: 'deleted'` oculta usuários da listagem `GET /admin/users` (filtro `$ne: 'deleted'`)
- Não refatorar partes do projeto não relacionadas à feature
- Não criar endpoint duplicado
- TypeScript correto em todo o código — sem `any` desnecessário
- Tailwind: sem classes como `bg-opacity-*` ou `/3`, `/8` — usar `/[0.03]`, `/[0.08]` ou steps padrão
- `import type { ReactNode } from 'react'` quando necessário (nunca `React.ReactNode`)
- `api` de `@/lib/axios` — nunca axios raw em pages ou services

---

### Task B1: User model + tipos backend

**Files:**
- Modify: `backend/src/types/index.ts` linha 7
- Modify: `backend/src/models/User.ts`

**Interfaces:**
- Produces: `UserStatus = 'active' | 'blocked' | 'deleted'`; `IUser` com 5 novos campos opcionais: `blockedUntil`, `blockedReason`, `blockedBy`, `deletedAt`, `deletedBy`

- [ ] **Step 1: Atualizar UserStatus em backend/src/types/index.ts**

Linha 7 atual:
```typescript
export type UserStatus = 'active' | 'blocked';
```
Substituir por:
```typescript
export type UserStatus = 'active' | 'blocked' | 'deleted';
```

- [ ] **Step 2: Atualizar IUser interface em backend/src/models/User.ts**

O topo do arquivo tem `import mongoose, { Schema, Document } from 'mongoose';` — verificar. Se não tiver `mongoose` no import (importa só `Schema, Document`), adicionar: `import mongoose, { Schema, Document } from 'mongoose';`

Substituir a interface `IUser` completa (linhas 4–15):
```typescript
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: UserRole;
  city: string;
  state: string;
  status: UserStatus;
  blockedUntil?: Date;
  blockedReason?: string;
  blockedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

- [ ] **Step 3: Atualizar enum `status` no schema**

No `userSchema`, o campo `status` (linhas 63–67) tem `enum: ['active', 'blocked']`. Substituir por:
```typescript
status: {
  type: String,
  enum: ['active', 'blocked', 'deleted'],
  default: 'active',
},
```

- [ ] **Step 4: Adicionar 5 novos campos ao schema após o campo `status`**

Imediatamente após o fechamento do campo `status` (antes do `}` que fecha o objeto de schema), adicionar:
```typescript
blockedUntil:  { type: Date },
blockedReason: { type: String },
blockedBy:     { type: Schema.Types.ObjectId, ref: 'User' },
deletedAt:     { type: Date },
deletedBy:     { type: Schema.Types.ObjectId, ref: 'User' },
```

---

### Task B2: AuditLog model

**Files:**
- Create: `backend/src/models/AuditLog.ts`

**Interfaces:**
- Produces: `IAuditLog` document type, `AuditAction` union type, `AuditLog` Mongoose model

- [ ] **Step 1: Criar backend/src/models/AuditLog.ts**

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction = 'block_user' | 'unblock_user' | 'delete_user';

export interface IAuditLog extends Document {
  targetUserId: mongoose.Types.ObjectId;
  targetUserName: string;
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  action: AuditAction;
  reason?: string;
  blockedUntil?: Date;
  previousStatus: string;
  newStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    targetUserId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserName: { type: String, required: true },
    adminId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    adminName:      { type: String, required: true },
    action: {
      type: String,
      enum: ['block_user', 'unblock_user', 'delete_user'],
      required: true,
    },
    reason:         { type: String },
    blockedUntil:   { type: Date },
    previousStatus: { type: String, required: true },
    newStatus:      { type: String, required: true },
  },
  { timestamps: true }
);

auditLogSchema.index({ targetUserId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
```

---

### Task B3: Admin service — novos métodos + filtro getUsers

**Files:**
- Modify: `backend/src/services/admin.service.ts`

**Interfaces:**
- Consumes: `AuditLog` de `../models/AuditLog`; `AppError` de `../utils/errors`; `mongoose` (default import); `IUser` atualizado de Task B1
- Produces: `blockUser(targetId, adminId, durationDays, reason?)`, `unblockUser(targetId, adminId)`, `deleteUser(targetId, adminId)`, `getUserHistory(targetId)` na classe `AdminService`; `getUsers` atualizado com filtro `$ne: 'deleted'`

- [ ] **Step 1: Adicionar imports ao topo de admin.service.ts**

Após os imports existentes (linhas 1–8), adicionar:
```typescript
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../utils/errors';
import mongoose from 'mongoose';
```

- [ ] **Step 2: Atualizar método getUsers (linha 75)**

Substituir o método `getUsers` completo:
```typescript
async getUsers(page = 1, limit = 20) {
  const filter = { status: { $ne: 'deleted' as const } };
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, total, page, limit };
}
```

- [ ] **Step 3: Adicionar método blockUser à classe AdminService**

Adicionar após o método `blockProvider` (linha 112), antes de `getServiceRequests`:
```typescript
async blockUser(targetId: string, adminId: string, durationDays: number, reason?: string) {
  if (targetId === adminId) {
    throw new AppError('Você não pode bloquear sua própria conta', 400);
  }

  const target = await User.findById(targetId);
  if (!target) throw new NotFoundError('Usuário');
  if (target.status === 'deleted') {
    throw new AppError('Usuário excluído não pode ser bloqueado', 400);
  }

  if (target.role === 'admin') {
    const remainingActiveAdmins = await User.countDocuments({
      role: 'admin',
      status: 'active',
      _id: { $ne: new mongoose.Types.ObjectId(targetId) },
    });
    if (remainingActiveAdmins === 0) {
      throw new AppError('Não é possível bloquear o último administrador ativo', 400);
    }
  }

  const previousStatus = target.status as string;
  const blockedUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  await User.findByIdAndUpdate(targetId, {
    $set: {
      status: 'blocked',
      blockedUntil,
      blockedReason: reason ?? null,
      blockedBy: new mongoose.Types.ObjectId(adminId),
    },
  });

  const admin = await User.findById(adminId).select('name');

  await AuditLog.create({
    targetUserId:   new mongoose.Types.ObjectId(targetId),
    targetUserName: target.name,
    adminId:        new mongoose.Types.ObjectId(adminId),
    adminName:      admin?.name ?? 'Desconhecido',
    action:         'block_user',
    reason:         reason ?? undefined,
    blockedUntil,
    previousStatus,
    newStatus: 'blocked',
  });

  return await User.findById(targetId);
}
```

- [ ] **Step 4: Adicionar método unblockUser à classe AdminService**

Adicionar imediatamente após `blockUser`:
```typescript
async unblockUser(targetId: string, adminId: string) {
  const target = await User.findById(targetId);
  if (!target) throw new NotFoundError('Usuário');
  if (target.status === 'deleted') {
    throw new AppError('Usuário excluído não pode ser desbloqueado', 400);
  }

  const previousStatus = target.status as string;

  await User.findByIdAndUpdate(targetId, {
    $set: { status: 'active' },
    $unset: { blockedUntil: 1, blockedReason: 1, blockedBy: 1 },
  });

  const admin = await User.findById(adminId).select('name');

  await AuditLog.create({
    targetUserId:   new mongoose.Types.ObjectId(targetId),
    targetUserName: target.name,
    adminId:        new mongoose.Types.ObjectId(adminId),
    adminName:      admin?.name ?? 'Desconhecido',
    action:         'unblock_user',
    previousStatus,
    newStatus: 'active',
  });

  return await User.findById(targetId);
}
```

- [ ] **Step 5: Adicionar método deleteUser à classe AdminService**

Adicionar após `unblockUser`:
```typescript
async deleteUser(targetId: string, adminId: string) {
  if (targetId === adminId) {
    throw new AppError('Você não pode excluir sua própria conta', 400);
  }

  const target = await User.findById(targetId);
  if (!target) throw new NotFoundError('Usuário');
  if (target.status === 'deleted') {
    throw new AppError('Usuário já foi excluído', 400);
  }

  if (target.role === 'admin') {
    const remainingAdmins = await User.countDocuments({
      role: 'admin',
      status: { $in: ['active', 'blocked'] },
      _id: { $ne: new mongoose.Types.ObjectId(targetId) },
    });
    if (remainingAdmins === 0) {
      throw new AppError('Não é possível excluir o único administrador restante', 400);
    }
  }

  const previousStatus = target.status as string;

  await User.findByIdAndUpdate(targetId, {
    $set: {
      status:    'deleted',
      deletedAt: new Date(),
      deletedBy: new mongoose.Types.ObjectId(adminId),
    },
  });

  const admin = await User.findById(adminId).select('name');

  await AuditLog.create({
    targetUserId:   new mongoose.Types.ObjectId(targetId),
    targetUserName: target.name,
    adminId:        new mongoose.Types.ObjectId(adminId),
    adminName:      admin?.name ?? 'Desconhecido',
    action:         'delete_user',
    previousStatus,
    newStatus: 'deleted',
  });

  return { success: true };
}
```

- [ ] **Step 6: Adicionar método getUserHistory à classe AdminService**

Adicionar após `deleteUser`:
```typescript
async getUserHistory(targetId: string) {
  const logs = await AuditLog.find({
    targetUserId: new mongoose.Types.ObjectId(targetId),
  })
    .sort({ createdAt: -1 })
    .limit(50);
  return logs;
}
```

---

### Task B4: Admin controller — 4 novos métodos

**Files:**
- Modify: `backend/src/controllers/admin.controller.ts`

**Interfaces:**
- Consumes: `adminService.blockUser`, `adminService.unblockUser`, `adminService.deleteUser`, `adminService.getUserHistory` (de Task B3)
- Produces: 4 novos métodos na classe `AdminController`

- [ ] **Step 1: Adicionar 4 métodos à classe AdminController**

Adicionar após o método `blockProvider` (linha 35), antes de `getServiceRequests`:
```typescript
async blockUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params['id']);
  const adminId = String(req.user!.userId);
  const { durationDays, reason } = req.body;
  const user = await adminService.blockUser(id, adminId, Number(durationDays), reason as string | undefined);
  sendSuccess(res, user, 'Usuário bloqueado com sucesso!');
}

async unblockUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params['id']);
  const adminId = String(req.user!.userId);
  const user = await adminService.unblockUser(id, adminId);
  sendSuccess(res, user, 'Usuário desbloqueado com sucesso!');
}

async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params['id']);
  const adminId = String(req.user!.userId);
  const result = await adminService.deleteUser(id, adminId);
  sendSuccess(res, result, 'Usuário excluído com sucesso!');
}

async getUserHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params['id']);
  const logs = await adminService.getUserHistory(id);
  sendSuccess(res, logs);
}
```

---

### Task B5: Admin routes — 4 novas rotas

**Files:**
- Modify: `backend/src/routes/admin.routes.ts`

- [ ] **Step 1: Substituir a seção Users nas rotas**

Substituir as linhas atuais da seção `// Users` (linhas 12–13):
```typescript
// Users
router.get('/users', (req, res) => adminController.getUsers(req as any, res));
```

Por:
```typescript
// Users
router.get('/users',                (req, res) => adminController.getUsers(req as any, res));
router.patch('/users/:id/block',    (req, res) => adminController.blockUser(req as any, res));
router.patch('/users/:id/unblock',  (req, res) => adminController.unblockUser(req as any, res));
router.delete('/users/:id',         (req, res) => adminController.deleteUser(req as any, res));
router.get('/users/:id/history',    (req, res) => adminController.getUserHistory(req as any, res));
```

---

### Task B6: Auth service — blockedUntil no login + getMe

**Files:**
- Modify: `backend/src/services/auth.service.ts`

**Interfaces:**
- Consumes: `IUser.blockedUntil`, `IUser.status === 'deleted'` (de Task B1)

- [ ] **Step 1: Atualizar verificação de status no método login**

O método `login` (linha 171) atualmente tem este bloco (linhas 180–183):
```typescript
// Verifica se está bloqueado
if (user.status === 'blocked') {
  throw new UnauthorizedError('Sua conta está bloqueada. Entre em contato com o suporte.');
}
```

Substituir por:
```typescript
// Verifica se está excluído (mesma mensagem de credenciais para não revelar)
if (user.status === 'deleted') {
  throw new UnauthorizedError('E-mail ou senha incorretos');
}

// Verifica se está bloqueado
if (user.status === 'blocked') {
  if (user.blockedUntil && user.blockedUntil <= new Date()) {
    // Bloqueio expirado — reativar automaticamente
    await User.findByIdAndUpdate(user._id, {
      $set: { status: 'active' },
      $unset: { blockedUntil: 1, blockedReason: 1, blockedBy: 1 },
    });
    user.status = 'active';
  } else {
    const until = user.blockedUntil
      ? user.blockedUntil.toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : null;
    throw new UnauthorizedError(
      until
        ? `Sua conta está bloqueada até ${until}. Entre em contato com o suporte.`
        : 'Sua conta está bloqueada. Entre em contato com o suporte.'
    );
  }
}
```

- [ ] **Step 2: Atualizar método getMe**

O método `getMe` (linha 215) começa:
```typescript
async getMe(userId: string): Promise<any> {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('Usuário');
  }
  // ... (linha 221: let profile = null)
```

Após o bloco `if (!user)` e antes de `let profile = null`, adicionar:
```typescript
if (user.status === 'deleted') {
  throw new NotFoundError('Usuário');
}

if (user.status === 'blocked' && user.blockedUntil && user.blockedUntil <= new Date()) {
  await User.findByIdAndUpdate(userId, {
    $set: { status: 'active' },
    $unset: { blockedUntil: 1, blockedReason: 1, blockedBy: 1 },
  });
  user.status = 'active';
}
```

O método `getMe` completo ficará:
```typescript
async getMe(userId: string): Promise<any> {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('Usuário');
  }

  if (user.status === 'deleted') {
    throw new NotFoundError('Usuário');
  }

  if (user.status === 'blocked' && user.blockedUntil && user.blockedUntil <= new Date()) {
    await User.findByIdAndUpdate(userId, {
      $set: { status: 'active' },
      $unset: { blockedUntil: 1, blockedReason: 1, blockedBy: 1 },
    });
    user.status = 'active';
  }

  let profile = null;
  if (user.role === 'provider') {
    profile = await ProviderProfile.findOne({ userId: user._id }).populate(
      'categories',
      'name slug'
    );
  }

  return { user, profile };
}
```

---

### Task B7: Backend typecheck + build

**Files:** nenhum arquivo novo

- [ ] **Step 1: Rodar typecheck**

```bash
cd backend && npm run typecheck
```
Expected: 0 erros. Se houver erros, corrigi-los antes de prosseguir.

- [ ] **Step 2: Rodar build**

```bash
cd backend && npm run build
```
Expected: Build concluído sem erros (`dist/` gerado).

---

### Task F1: Frontend — types + admin.service.ts

**Files:**
- Modify: `frontend/src/types/index.ts` linha 2
- Modify: `frontend/src/services/admin.service.ts`

**Interfaces:**
- Produces: `UserStatus = 'active' | 'blocked' | 'deleted'` no frontend; `AdminUser` com `status: 'active' | 'blocked' | 'deleted'` e `blockedUntil?: string`; interface `AuditLogEntry`; 4 novas funções no `adminService`

- [ ] **Step 1: Atualizar UserStatus em frontend/src/types/index.ts**

Linha 2 atual:
```typescript
export type UserStatus = 'active' | 'blocked';
```
Substituir por:
```typescript
export type UserStatus = 'active' | 'blocked' | 'deleted';
```

- [ ] **Step 2: Atualizar interface AdminUser em frontend/src/services/admin.service.ts**

Substituir a interface `AdminUser` (linhas 3–13):
```typescript
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'provider' | 'admin';
  status: 'active' | 'blocked' | 'deleted';
  blockedUntil?: string;
  blockedReason?: string;
  city?: string;
  state?: string;
  phone?: string;
  createdAt: string;
}
```

- [ ] **Step 3: Adicionar interface AuditLogEntry após AdminPayment**

Adicionar após o fechamento da interface `AdminPayment` (após linha 89):
```typescript
export interface AuditLogEntry {
  _id: string;
  targetUserId: string;
  targetUserName: string;
  adminId: string;
  adminName: string;
  action: 'block_user' | 'unblock_user' | 'delete_user';
  reason?: string;
  blockedUntil?: string;
  previousStatus: string;
  newStatus: string;
  createdAt: string;
}
```

- [ ] **Step 4: Adicionar 4 funções após getPayments (antes de export const adminService)**

Adicionar após a função `getPayments` (linha 140), antes de `export const adminService = {`:
```typescript
async function blockUser(id: string, durationDays: number, reason?: string) {
  const res = await api.patch(`/admin/users/${id}/block`, { durationDays, reason });
  return res.data.data as AdminUser;
}

async function unblockUser(id: string) {
  const res = await api.patch(`/admin/users/${id}/unblock`);
  return res.data.data as AdminUser;
}

async function deleteUser(id: string) {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data as { success: boolean; message?: string };
}

async function getUserHistory(id: string) {
  const res = await api.get(`/admin/users/${id}/history`);
  return res.data.data as AuditLogEntry[];
}
```

- [ ] **Step 5: Adicionar as 4 novas funções ao objeto exportado adminService**

O objeto `export const adminService` atual (linha 142) lista as funções existentes. Adicionar as 4 novas ao objeto:
```typescript
export const adminService = {
  getUsers,
  getProviders,
  approveProvider,
  blockProvider,
  getServiceRequests,
  getOrders,
  getDisputes,
  updateDisputeStatus,
  getPayments,
  blockUser,
  unblockUser,
  deleteUser,
  getUserHistory,
};
```

---

### Task F2: UsersPage.tsx — reescrita completa com modais

**Files:**
- Modify: `frontend/src/pages/admin/UsersPage.tsx`

**Interfaces:**
- Consumes: `adminService.getUsers`, `adminService.blockUser`, `adminService.unblockUser`, `adminService.deleteUser`, `adminService.getUserHistory`; `AdminUser`, `AuditLogEntry` de `@/services/admin.service`; `useAuth` de `@/hooks/useAuth`; `formatDate`, `formatDateTime` de `@/lib/utils`; `fadeUp` de `@/lib/animations`

**Mudanças-chave em relação ao arquivo atual:**
- Email REMOVIDO da listagem (mantido no search por utilidade do admin, mas não exibido)
- Badge `'Você'` no usuário logado (auto-proteção visual)
- Status `deleted` → badge vermelho `'Excluído'`
- Botões por status: `active` → [Bloquear][Excluir][Histórico]; `blocked` → [Desbloquear][Excluir][Histórico]; `deleted` → [Histórico]
- Bloqueio via BlockModal (duration selector + motivo opcional)
- Exclusão via DeleteModal (checkbox confirmação)
- Histórico via HistoryModal (lista de AuditLogEntry)
- `loadUsers()` callable a qualquer momento para recarregar lista após ação

- [ ] **Step 1: Reescrever frontend/src/pages/admin/UsersPage.tsx com o seguinte conteúdo:**

```typescript
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Users, Search, AlertCircle, ShieldCheck, User, HardHat,
  Lock, Unlock, Trash2, History, X, Clock,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type { AdminUser, AuditLogEntry } from '@/services/admin.service';
import { useAuth } from '@/hooks/useAuth';
import { fadeUp } from '@/lib/animations';
import { formatDate, formatDateTime } from '@/lib/utils';

// ── Config ────────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; cls: string; icon: typeof User }> = {
  client:   { label: 'Cliente',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20',         icon: User },
  provider: { label: 'Prestador', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: HardHat },
  admin:    { label: 'Admin',     cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20',    icon: ShieldCheck },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  active:  { label: 'Ativo',     cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  blocked: { label: 'Bloqueado', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  deleted: { label: 'Excluído',  cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

const ACTION_CONFIG: Record<string, { label: string; cls: string }> = {
  block_user:   { label: 'Bloqueio',    cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  unblock_user: { label: 'Desbloqueio', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  delete_user:  { label: 'Exclusão',   cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

const DURATION_OPTIONS = [
  { value: 1,  label: '1 dia' },
  { value: 7,  label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
];

// ── Backdrop ──────────────────────────────────────────────────────────────────

function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
      onClick={onClose}
    />
  );
}

// ── BlockModal ────────────────────────────────────────────────────────────────

function BlockModal({
  user,
  onClose,
  onSuccess,
}: {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [days, setDays] = useState(7);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleBlock() {
    setLoading(true);
    setError('');
    try {
      await adminService.blockUser(user._id, days, reason.trim() || undefined);
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Não foi possível bloquear o usuário.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Backdrop onClose={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 p-6 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0d1530 0%, #0a0f1e 100%)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Bloquear usuário</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-white/50 mb-5">
          Bloqueando <span className="text-white font-semibold">{user.name}</span>.
          O usuário não conseguirá entrar na plataforma durante o período.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
              Duração do bloqueio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDays(opt.value)}
                  className={`rounded-xl border py-2 text-sm font-semibold transition-all ${
                    days === opt.value
                      ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                      : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
              Motivo{' '}
              <span className="text-white/20 font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Descreva o motivo do bloqueio..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-500/50 resize-none transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-white/50 hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleBlock}
              disabled={loading}
              className="flex-1 rounded-xl bg-amber-500/20 border border-amber-500/30 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/30 transition-all disabled:opacity-40"
            >
              {loading ? 'Bloqueando...' : 'Bloquear'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── DeleteModal ───────────────────────────────────────────────────────────────

function DeleteModal({
  user,
  onClose,
  onSuccess,
}: {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  async function handleDelete() {
    setLoading(true);
    setError('');
    try {
      await adminService.deleteUser(user._id);
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Não foi possível excluir o usuário.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Backdrop onClose={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-red-500/20 p-6 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0d1530 0%, #0a0f1e 100%)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-400" />
            <h2 className="text-base font-bold text-white">Excluir usuário</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 mb-5">
          <p className="text-sm text-red-300 font-semibold mb-1">Ação irreversível</p>
          <p className="text-xs text-red-200/70">
            O usuário <span className="font-semibold text-red-200">{user.name}</span> será marcado
            como excluído e não conseguirá mais acessar a plataforma. Os dados relacionados
            (ordens, orçamentos) serão preservados.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-red-500 cursor-pointer"
          />
          <span className="text-sm text-white/60">
            Entendo que esta ação não pode ser desfeita.
          </span>
        </label>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 mb-4">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-white/50 hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || !confirmed}
            className="flex-1 rounded-xl bg-red-500/20 border border-red-500/30 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/30 transition-all disabled:opacity-40"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ── HistoryModal ──────────────────────────────────────────────────────────────

function HistoryModal({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getUserHistory(user._id)
      .then(setLogs)
      .catch(() => setError('Não foi possível carregar o histórico.'))
      .finally(() => setLoading(false));
  }, [user._id]);

  return (
    <>
      <Backdrop onClose={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 p-6 shadow-2xl flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #0d1530 0%, #0a0f1e 100%)',
          maxHeight: '80vh',
        }}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            <h2 className="text-base font-bold text-white">Histórico de ações</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-white/40 mb-4 shrink-0">
          Usuário: <span className="text-white/70 font-semibold">{user.name}</span>
        </p>

        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 min-h-0">
          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="rounded-xl border border-white/5 p-3 animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="h-3 bg-white/5 rounded w-1/3 mb-2" />
                  <div className="h-2.5 bg-white/5 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-8 w-8 text-white/15 mb-3" />
              <p className="text-sm text-white/30">Nenhuma ação registrada para este usuário.</p>
            </div>
          )}

          {!loading && !error && logs.map(log => {
            const cfg = ACTION_CONFIG[log.action] ?? {
              label: log.action,
              cls: 'text-white/50 bg-white/5 border-white/10',
            };
            return (
              <div
                key={log._id}
                className="rounded-xl border border-white/5 p-3"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[11px] text-white/30">{formatDateTime(log.createdAt)}</span>
                </div>
                <p className="text-xs text-white/50">
                  Por: <span className="text-white/70">{log.adminName}</span>
                </p>
                {log.reason && (
                  <p className="text-xs text-white/40 mt-1">Motivo: {log.reason}</p>
                )}
                {log.blockedUntil && (
                  <p className="text-xs text-white/40 mt-1">
                    Até: {formatDateTime(log.blockedUntil)}
                  </p>
                )}
                <p className="text-[11px] text-white/25 mt-1">
                  {log.previousStatus} → {log.newStatus}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AdminUsersPage() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const [blockTarget, setBlockTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AdminUser | null>(null);

  function loadUsers() {
    setLoading(true);
    setError('');
    setActionError('');
    adminService.getUsers(200)
      .then(({ users: u, total: t }) => { setUsers(u); setTotal(t); })
      .catch(() => setError('Não foi possível carregar os usuários.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function handleBlockSuccess() {
    setBlockTarget(null);
    loadUsers();
  }

  function handleDeleteSuccess() {
    setDeleteTarget(null);
    loadUsers();
  }

  function handleUnblock(u: AdminUser) {
    setActionError('');
    adminService.unblockUser(u._id)
      .then(() => loadUsers())
      .catch((e: any) => {
        setActionError(e?.response?.data?.message ?? 'Não foi possível desbloquear o usuário.');
      });
  }

  const isSelf = (u: AdminUser) => u._id === (authUser as any)?._id;

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-400" /> Usuários
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {total} usuário{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5
            text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-all"
        />
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{actionError}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 p-4 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-2.5 bg-white/5 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <motion.div {...fadeUp(0.1)} className="space-y-2">
          {filtered.map((u, i) => {
            const RoleIcon = ROLE_CONFIG[u.role]?.icon ?? User;
            const self = isSelf(u);
            const isDeleted = u.status === 'deleted';
            return (
              <motion.div
                key={u._id}
                {...fadeUp(0.05 + i * 0.02)}
                className="flex items-center gap-4 rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/5">
                  <RoleIcon className="h-5 w-5 text-white/50" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                    {self && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-400 uppercase tracking-wider shrink-0">
                        Você
                      </span>
                    )}
                  </div>
                  {(u.city || u.state) && (
                    <p className="text-xs text-white/25">{[u.city, u.state].filter(Boolean).join(', ')}</p>
                  )}
                  {u.status === 'blocked' && u.blockedUntil && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3 text-amber-400/60" />
                      <p className="text-[11px] text-amber-400/60">Até {formatDate(u.blockedUntil)}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_CONFIG[u.role]?.cls ?? 'text-white/40 bg-white/5 border-white/10'}`}>
                    {ROLE_CONFIG[u.role]?.label ?? u.role}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[u.status]?.cls ?? 'text-white/40 bg-white/5 border-white/10'}`}>
                    {STATUS_CONFIG[u.status]?.label ?? u.status}
                  </span>

                  {!self && !isDeleted && u.status === 'active' && (
                    <button
                      onClick={() => setBlockTarget(u)}
                      className="flex items-center gap-1 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
                    >
                      <Lock className="h-3 w-3" /> Bloquear
                    </button>
                  )}
                  {!self && !isDeleted && u.status === 'blocked' && (
                    <button
                      onClick={() => handleUnblock(u)}
                      className="flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                      <Unlock className="h-3 w-3" /> Desbloquear
                    </button>
                  )}
                  {!self && !isDeleted && (
                    <button
                      onClick={() => setDeleteTarget(u)}
                      className="flex items-center gap-1 rounded-lg border border-red-500/25 bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="h-3 w-3" /> Excluir
                    </button>
                  )}
                  <button
                    onClick={() => setHistoryTarget(u)}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/40 hover:bg-white/10 hover:text-white/70 transition-all"
                  >
                    <History className="h-3 w-3" /> Histórico
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {blockTarget && (
          <BlockModal
            user={blockTarget}
            onClose={() => setBlockTarget(null)}
            onSuccess={handleBlockSuccess}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            user={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onSuccess={handleDeleteSuccess}
          />
        )}
        {historyTarget && (
          <HistoryModal
            user={historyTarget}
            onClose={() => setHistoryTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Nota sobre `isSelf`:** A função usa `(authUser as any)?._id` porque o tipo `User` do `useAuth()` pode expor `_id` mas o TypeScript pode não reconhecê-lo dependendo da versão do AuthContext. Se o typecheck reclamar, verificar o tipo retornado por `useAuth().user` e ajustar o cast.

---

### Task F3: Frontend typecheck + build

**Files:** nenhum arquivo novo

- [ ] **Step 1: Rodar typecheck**

```bash
cd frontend && npm run typecheck
```
Expected: 0 erros. Se houver, corrigir antes de continuar.

- [ ] **Step 2: Rodar build**

```bash
cd frontend && npm run build
```
Expected: Build concluído sem erros.

---

## Ordem de execução

```
B1 → B2 → B3 → B4 → B5 → B6 → B7 → F1 → F2 → F3
```

Tasks B1–B7 são todas backend; F1–F3 são todas frontend. Dentro de cada grupo, há dependências sequenciais (B1 antes de B2, B2 antes de B3, etc.). Backend e frontend podem ser iniciados independentemente, mas B7 deve passar antes de F1 para garantir que não há regressões no backend antes de continuar.
