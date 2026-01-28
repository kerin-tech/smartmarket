// src/routes/ocrRoutes.ts

import { Router } from 'express';
import multer from 'multer';
import { processTicket, healthCheck } from '../controllers/ocr.controller';
import { checkJwt } from '../middlewares/auth.middleware';

const router = Router();

// Configuración de Multer para recibir archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no soportado'));
    }
  },
});

// GET /api/v1/ocr/health - Health check (público para monitoreo)
router.get('/health', healthCheck);

// POST /api/v1/ocr/process - Procesar ticket (requiere auth)
router.post('/process', checkJwt, upload.single('image'), processTicket);

export default router;