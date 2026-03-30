import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { DashboardService } from '../services/dashboard.service';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardQueryValidator } from '../validators/dashboard.validator';

const router = Router();
const controller = new DashboardController(new DashboardService());
const queryValidator = new DashboardQueryValidator();

// GET /dashboard
router.get('/', authMiddleware, queryValidator.validate, controller.getSummary);

export default router;
