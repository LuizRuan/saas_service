import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import { orderController } from '../controllers/order.controller';
import { uploadOrderPhotos } from '../utils/upload';

const router = Router();

router.use(authenticate);

router.get('/my', (req, res) => orderController.getMy(req as any, res));
router.get('/:id', (req, res) => orderController.getById(req as any, res));
router.patch('/:id/status', authorize('provider', 'admin'), (req, res) =>
  orderController.updateStatus(req as any, res)
);
router.patch('/:id/photos', authorize('provider'), uploadOrderPhotos, (req, res) =>
  orderController.updatePhotos(req as any, res)
);
router.patch('/:id/signatures', authorize('client', 'provider'), (req, res) =>
  orderController.updateSignature(req as any, res)
);
router.patch('/:id/approve-completion', authorize('client'), (req, res) =>
  orderController.approveCompletion(req as any, res)
);

export default router;
