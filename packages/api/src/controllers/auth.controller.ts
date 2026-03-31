import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthService } from '../services/auth.service';
import type { UpdateProfileDto, UpdatePasswordDto } from '../validators/auth.validator';

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

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.updateProfile(req.user!.id, req.body as UpdateProfileDto);
    res.json({ user });
  });

  updatePassword = asyncHandler(async (req: Request, res: Response) => {
    await this.service.updatePassword(req.user!.id, req.body as UpdatePasswordDto);
    res.status(200).json({ message: 'Password updated' });
  });
}
