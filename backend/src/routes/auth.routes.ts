import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Rotas públicas
router.post('/register/client', authController.registerClient);
router.post('/register/provider', authController.registerProvider);
router.post('/login', authController.login);

// Rota protegida
router.get('/me', authenticate, authController.getMe);

export default router;
