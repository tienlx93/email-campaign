import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { CampaignService } from '../services/campaign.service';

export class CampaignController {
  constructor(private service: CampaignService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.list(req.user!.id, req.body);
    res.json(result);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.create(req.user!.id, req.body);
    res.status(201).json(result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = parseInt(String(req.params.id), 10);
    const result = await this.service.getById(req.user!.id, campaignId);
    res.json(result);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = parseInt(String(req.params.id), 10);
    const result = await this.service.update(req.user!.id, campaignId, req.body);
    res.json(result);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = parseInt(String(req.params.id), 10);
    await this.service.delete(req.user!.id, campaignId);
    res.status(204).send();
  });

  schedule = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = parseInt(String(req.params.id), 10);
    const result = await this.service.schedule(req.user!.id, campaignId, req.body);
    res.json(result);
  });

  send = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = parseInt(String(req.params.id), 10);
    const result = await this.service.send(req.user!.id, campaignId);
    res.json(result);
  });

  stats = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = parseInt(String(req.params.id), 10);
    const result = await this.service.getStats(req.user!.id, campaignId);
    res.json(result);
  });
}
