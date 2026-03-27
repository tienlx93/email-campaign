import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { CampaignService } from '../services/campaign.service';
import { CampaignController } from '../controllers/campaign.controller';
import {
  CreateCampaignValidator,
  UpdateCampaignValidator,
  ScheduleCampaignValidator,
  CampaignIdParamValidator,
  ListCampaignsQueryValidator,
} from '../validators/campaign.validator';

const router = Router();
router.use(authMiddleware);

const controller = new CampaignController(new CampaignService());
const idValidator = new CampaignIdParamValidator();
const listQueryValidator = new ListCampaignsQueryValidator();
const createValidator = new CreateCampaignValidator();
const updateValidator = new UpdateCampaignValidator();
const scheduleValidator = new ScheduleCampaignValidator();

// GET /campaigns
router.get('/', listQueryValidator.validate, controller.list);

// POST /campaigns
router.post('/', createValidator.validate, controller.create);

// GET /campaigns/:id
router.get('/:id', idValidator.validate, controller.getById);

// PATCH /campaigns/:id
router.patch('/:id', idValidator.validate, updateValidator.validate, controller.update);

// DELETE /campaigns/:id
router.delete('/:id', idValidator.validate, controller.delete);

// POST /campaigns/:id/schedule
router.post('/:id/schedule', idValidator.validate, scheduleValidator.validate, controller.schedule);

// POST /campaigns/:id/send
router.post('/:id/send', idValidator.validate, controller.send);

// GET /campaigns/:id/stats
router.get('/:id/stats', idValidator.validate, controller.stats);

export default router;
