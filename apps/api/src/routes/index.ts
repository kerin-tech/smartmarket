import { Router } from 'express';

import users from './user.routes';
import authRoutes from './auth.routes';  // ← Agregar

const router: Router = Router();

router.use('/users', users);
router.use('/auth', authRoutes);  // ← Agregar

export default router;