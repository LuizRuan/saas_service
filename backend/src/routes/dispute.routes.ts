import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import { disputeController } from '../controllers/dispute.controller';
import { uploadDisputePhotos } from '../utils/upload';

const router = Router();

router.use(authenticate);

router.post('/', authorize('client', 'provider'), uploadDisputePhotos, (req, res) =>
  disputeController.create(req as any, res)
);
router.get('/my', (req, res) => disputeController.getMy(req as any, res));
router.get('/:id', (req, res) => disputeController.getById(req as any, res));

export default router;
