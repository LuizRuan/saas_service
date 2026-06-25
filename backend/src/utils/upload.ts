import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { RequestHandler } from 'express';
import { env } from '../config/env';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function createStorage(folder: string) {
  const dest = path.join('uploads', folder);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
}

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const extOk = /\.(jpe?g|png|webp)$/i.test(path.extname(file.originalname));
  const mimeOk = /^image\/(jpeg|png|webp)$/.test(file.mimetype);
  if (extOk && mimeOk) cb(null, true);
  else cb(new Error('Apenas imagens JPEG, PNG ou WebP são permitidas'));
};

function createUploader(folder: string, maxCount = 10): RequestHandler {
  return multer({
    storage: createStorage(folder),
    limits: { fileSize: env.UPLOAD_MAX_SIZE_MB * 1024 * 1024 },
    fileFilter: imageFilter,
  }).array('photos', maxCount) as RequestHandler;
}

export const uploadServiceRequestPhotos = createUploader('service-requests', 5);
export const uploadOrderPhotos = createUploader('orders', 10);
export const uploadDisputePhotos = createUploader('disputes', 5);

export function buildFilePaths(files: Express.Multer.File[], folder: string): string[] {
  return (files ?? []).map(f => `/uploads/${folder}/${f.filename}`);
}
