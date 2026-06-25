import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import { providerController } from '../controllers/provider.controller';

const router = Router();

// Rotas públicas
router.get('/search', (req, res) => providerController.search(req as any, res));

// Rotas autenticadas — prestador gerenciando próprio perfil
router.get('/me', authenticate, authorize('provider'), (req, res) => providerController.getMe(req as any, res));
router.put('/me', authenticate, authorize('provider'), (req, res) => providerController.updateMe(req as any, res));

// Rota protegida (qualquer papel)
router.get('/:id', authenticate, (req, res) => providerController.getById(req as any, res));

export default router;
