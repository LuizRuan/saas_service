import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { validate } from '../middlewares/validate';
import { loginSchema, registerClientSchema, registerProviderSchema } from '../schemas/auth.schema';

const router = Router();

// Rotas públicas
router.post('/register/client', authRateLimiter, validate(registerClientSchema), authController.registerClient);
router.post('/register/provider', authRateLimiter, validate(registerProviderSchema), authController.registerProvider);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);

// Rotas protegidas
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);

export default router;
