import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import type { DashboardService } from '../services/dashboard.service';
import type { DashboardQueryDto } from '../validators/dashboard.validator';

export class DashboardController {
  constructor(private service: DashboardService) {}

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = await this.service.getSummary(userId, req.body as DashboardQueryDto);
    res.json(data);
  });
}
