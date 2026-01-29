// src/routes/index.ts

import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import storeRoutes from './store.routes';
import purchaseRoutes from './purchase.routes';
import analyticsRoutes from './analytics.routes';
import userRoutes from './user.routes';
import ticketRoutes from './ticket.routes';
import ticketParserRoutes from './ticketParser.routes'; // ← AGREGAR

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/stores', storeRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/tickets', ticketRoutes);
router.use('/ticket-parser', ticketParserRoutes); // ← AGREGAR

export default router;