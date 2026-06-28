import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { authRateLimiter, signupRateLimiter, refreshRateLimiter } from '../middlewares/rateLimiter';
import { validate } from '../middlewares/validate';
import { loginSchema, registerClientSchema, registerProviderSchema } from '../schemas/auth.schema';

const router = Router();

// Rotas públicas
router.post('/register/client', signupRateLimiter, validate(registerClientSchema), authController.registerClient);
router.post('/register/provider', signupRateLimiter, validate(registerProviderSchema), authController.registerProvider);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', refreshRateLimiter, authController.refreshToken);

// Rotas públicas extras
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Rotas protegidas
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);
router.post('/logout', authenticate, authController.logout);

export default router;
