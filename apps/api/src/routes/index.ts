import { Router } from 'express';

import authRoutes from './auth.routes';  // ← Agregar

const router: Router = Router();

router.use('/auth', authRoutes);  // ← Agregar

export default router;