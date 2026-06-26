import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import { adminController } from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('admin'));

// Stats
router.get('/stats', (req, res) => adminController.getStats(req as any, res));

// Users
router.get('/users',               (req, res) => adminController.getUsers(req as any, res));
router.patch('/users/:id/block',   (req, res) => adminController.blockUser(req as any, res));
router.patch('/users/:id/unblock', (req, res) => adminController.unblockUser(req as any, res));
router.delete('/users/:id',        (req, res) => adminController.deleteUser(req as any, res));
router.get('/users/:id/history',   (req, res) => adminController.getUserHistory(req as any, res));

// Providers
router.get('/providers', (req, res) => adminController.getProviders(req as any, res));
router.patch('/providers/:id/approve', (req, res) => adminController.approveProvider(req as any, res));
router.patch('/providers/:id/block', (req, res) => adminController.blockProvider(req as any, res));

// Service Requests
router.get('/service-requests', (req, res) => adminController.getServiceRequests(req as any, res));

// Orders
router.get('/orders', (req, res) => adminController.getOrders(req as any, res));

// Payments
router.get('/payments', (req, res) => adminController.getPayments(req as any, res));

// Disputes
router.get('/disputes', (req, res) => adminController.getDisputes(req as any, res));
router.patch('/disputes/:id/status', (req, res) => adminController.updateDisputeStatus(req as any, res));

export default router;
