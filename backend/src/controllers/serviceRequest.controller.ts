import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { serviceRequestService } from '../services/serviceRequest.service';
import { sendSuccess } from '../utils/response';
import { buildFilePaths } from '../utils/upload';
import { parsePagination } from '../utils/pagination';

class ServiceRequestController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { categoryId, city, neighborhood, approximateAddress, fullAddress, description, desiredDate, desiredDateEnd, urgency, budget } = req.body;
    const files = (req.files as Express.Multer.File[]) ?? [];
    const photos = buildFilePaths(files, 'service-requests');

    const request = await serviceRequestService.create({
      clientId: req.user!.userId,
      categoryId,
      city,
      neighborhood,
      approximateAddress,
      fullAddress,
      description,
      photos,
      desiredDate: desiredDate ? new Date(desiredDate) : undefined,
      desiredDateEnd: desiredDateEnd ? new Date(desiredDateEnd) : undefined,
      urgency,
      budget: budget != null ? Number(budget) : undefined,
    });
    sendSuccess(res, request, 'Solicitação criada com sucesso!', 201);
  }


  async getMy(req: AuthenticatedRequest, res: Response): Promise<void> {
    const pagination = parsePagination(req.query);
    const result = await serviceRequestService.getMy(req.user!.userId, pagination);
    sendSuccess(res, result);
  }

  async getAvailable(req: AuthenticatedRequest, res: Response): Promise<void> {
    const pagination = parsePagination(req.query);
    const result = await serviceRequestService.getAvailable(req.user!.userId, pagination);
    sendSuccess(res, result);
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const result = await serviceRequestService.getById(id, req.user!.userId, req.user!.role);
    sendSuccess(res, result);
  }

  async cancel(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const result = await serviceRequestService.cancel(id, req.user!.userId, req.user!.role);
    sendSuccess(res, result, 'Solicitação cancelada com sucesso!');
  }
}

export const serviceRequestController = new ServiceRequestController();
