import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import { reviewController } from '../controllers/review.controller';

const router = Router();

router.get('/provider/:providerId', (req, res) =>
  reviewController.getByProvider(req as any, res)
);

router.use(authenticate);

router.post('/', authorize('client'), (req, res) =>
  reviewController.create(req as any, res)
);
router.get('/my', (req, res) => reviewController.getMy(req as any, res));

export default router;
