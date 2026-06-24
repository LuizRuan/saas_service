import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';

export async function getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await Category.find({ active: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: { categories } });
  } catch (err) {
    next(err);
  }
}
