import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import { quoteController } from '../controllers/quote.controller';

const router = Router();

router.use(authenticate);

router.post('/', authorize('provider'), (req, res) =>
  quoteController.create(req as any, res)
);
router.get('/my', authorize('client', 'provider'), (req, res) =>
  quoteController.getMy(req as any, res)
);
router.get('/request/:serviceRequestId', authorize('client', 'admin'), (req, res) =>
  quoteController.getByRequest(req as any, res)
);
router.patch('/:id/accept', authorize('client'), (req, res) =>
  quoteController.accept(req as any, res)
);
router.patch('/:id/reject', authorize('client'), (req, res) =>
  quoteController.reject(req as any, res)
);

export default router;
