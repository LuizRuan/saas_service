import { Router } from 'express';
import { authenticate } from '../middlewares';
import { providerController } from '../controllers/provider.controller';

const router = Router();

// Busca pública de prestadores (autenticado, qualquer papel)
router.get('/search', authenticate, (req, res) => providerController.search(req as any, res));
router.get('/:id', authenticate, (req, res) => providerController.getById(req as any, res));

export default router;
