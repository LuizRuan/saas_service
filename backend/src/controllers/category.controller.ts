import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';

class CategoryController {
  /**
   * GET /api/categories
   * Lista todas as categorias ativas
   */
  async list(_req: Request, res: Response): Promise<void> {
    const categories = await Category.find({ active: true }).sort({ name: 1 });
    sendSuccess(res, categories);
  }

  /**
   * GET /api/categories/:slug
   * Busca categoria por slug
   */
  async getBySlug(req: Request, res: Response): Promise<void> {
    const category = await Category.findOne({
      slug: req.params.slug,
      active: true,
    });

    if (!category) {
      throw new NotFoundError('Categoria');
    }

    sendSuccess(res, category);
  }
}

export const categoryController = new CategoryController();
