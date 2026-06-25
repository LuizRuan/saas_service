import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import { serviceRequestController } from '../controllers/serviceRequest.controller';
import { uploadServiceRequestPhotos } from '../utils/upload';

const router = Router();

router.use(authenticate);

router.post('/', authorize('client', 'admin'), uploadServiceRequestPhotos, (req, res) =>
  serviceRequestController.create(req as any, res)
);
router.get('/my', authorize('client'), (req, res) =>
  serviceRequestController.getMy(req as any, res)
);
router.get('/available', authorize('provider'), (req, res) =>
  serviceRequestController.getAvailable(req as any, res)
);
router.get('/:id', (req, res) => serviceRequestController.getById(req as any, res));
router.patch('/:id/cancel', authorize('client', 'admin'), (req, res) =>
  serviceRequestController.cancel(req as any, res)
);

export default router;
