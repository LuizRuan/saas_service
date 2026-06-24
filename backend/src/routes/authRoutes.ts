import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register/client', authController.registerClient);
router.post('/register/provider', authController.registerProvider);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);

export default router;
