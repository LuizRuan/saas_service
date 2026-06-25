import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import { adminController } from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/users', (req, res) => adminController.getUsers(req as any, res));
router.get('/providers', (req, res) => adminController.getProviders(req as any, res));
router.patch('/providers/:id/approve', (req, res) =>
  adminController.approveProvider(req as any, res)
);
router.patch('/providers/:id/block', (req, res) =>
  adminController.blockProvider(req as any, res)
);
router.get('/service-requests', (req, res) =>
  adminController.getServiceRequests(req as any, res)
);
router.get('/orders', (req, res) => adminController.getOrders(req as any, res));
router.get('/payments', (req, res) => adminController.getPayments(req as any, res));
router.get('/disputes', (req, res) => adminController.getDisputes(req as any, res));
router.patch('/disputes/:id/status', (req, res) =>
  adminController.updateDisputeStatus(req as any, res)
);

export default router;
