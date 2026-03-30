// src/routes/reportRoutes.ts
import { Router } from 'express';
import { ReportController } from '../controllers/reportController';

const router = Router();

// Mobilden /api/reports/add adresine POST isteği gelirse saveReport fonksiyonunu çalıştır
router.post('/add', ReportController.saveReport);

export default router;