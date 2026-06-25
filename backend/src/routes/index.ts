import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import serviceRequestRoutes from './serviceRequest.routes';
import quoteRoutes from './quote.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';
import disputeRoutes from './dispute.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/service-requests', serviceRequestRoutes);
router.use('/quotes', quoteRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/disputes', disputeRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'MãoCerta API está funcionando!',
    timestamp: new Date().toISOString(),
  });
});

export default router;
