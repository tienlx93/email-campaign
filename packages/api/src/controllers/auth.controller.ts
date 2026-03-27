import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthService } from '../services/auth.service';

export class AuthController {
  constructor(private service: AuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.register(req.body);
    res.status(201).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.login(req.body);
    res.status(200).json(result);
  });
}
