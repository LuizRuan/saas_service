import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import { paymentController } from '../controllers/payment.controller';

const router = Router();

router.use(authenticate);

router.get('/my', (req, res) => paymentController.getMy(req as any, res));
router.post('/:orderId/deposit/simulate', authorize('client'), (req, res) =>
  paymentController.simulateDeposit(req as any, res)
);
router.post('/:orderId/remaining/simulate', authorize('client'), (req, res) =>
  paymentController.simulateRemaining(req as any, res)
);

export default router;
