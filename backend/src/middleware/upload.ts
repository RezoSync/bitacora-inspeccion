import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env';

const uploadPath = path.resolve(env.uploadDir);
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadPath,
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9_-]/g, '_');
    callback(null, `${Date.now()}-${safeName}${extension}`);
  },
});

export const uploadEvidence = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});
