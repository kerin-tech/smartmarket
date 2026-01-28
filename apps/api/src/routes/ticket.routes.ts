// src/routes/ticket.routes.ts

import { Router } from 'express';
import multer from 'multer';
import { 
  uploadTicket, 
  getTicket, 
  listTickets, 
  removeTicket, 
  healthCheck,
  confirmTicketHandler
} from '../controllers/ticket.controller';
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

// GET /api/v1/tickets/health - Health check (público)
router.get('/health', healthCheck);

// POST /api/v1/tickets/upload - Subir y procesar ticket
router.post('/upload', checkJwt, upload.single('image'), uploadTicket);

// GET /api/v1/tickets - Listar tickets del usuario
router.get('/', checkJwt, listTickets);

// GET /api/v1/tickets/:id - Obtener ticket por ID
router.get('/:id', checkJwt, getTicket);

// DELETE /api/v1/tickets/:id - Eliminar ticket
router.delete('/:id', checkJwt, removeTicket);

// POST /api/v1/tickets/:id/confirm - Confirmar ticket y crear compras
router.post('/:id/confirm', checkJwt, confirmTicketHandler);

export default router;