import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { disputeService } from '../services/dispute.service';
import { sendSuccess } from '../utils/response';
import { buildFilePaths } from '../utils/upload';

class DisputeController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId, reason, description } = req.body;
    const files = (req.files as Express.Multer.File[]) ?? [];
    const evidencePhotos = buildFilePaths(files, 'disputes');

    const dispute = await disputeService.create(
      { orderId, reason, description, evidencePhotos },
      req.user!.userId
    );
    sendSuccess(res, dispute, 'Disputa aberta com sucesso!', 201);
  }

  async getMy(req: AuthenticatedRequest, res: Response): Promise<void> {
    const disputes = await disputeService.getMy(req.user!.userId);
    sendSuccess(res, disputes);
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const dispute = await disputeService.getById(id, req.user!.userId, req.user!.role);
    sendSuccess(res, dispute);
  }
}

export const disputeController = new DisputeController();
