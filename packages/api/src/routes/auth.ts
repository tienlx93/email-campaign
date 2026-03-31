import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { RegisterValidator, LoginValidator, UpdateProfileValidator, UpdatePasswordValidator } from '../validators/auth.validator';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const controller = new AuthController(new AuthService());
const registerValidator = new RegisterValidator();
const loginValidator = new LoginValidator();
const updateProfileValidator = new UpdateProfileValidator();
const updatePasswordValidator = new UpdatePasswordValidator();

// POST /auth/register
router.post('/register', registerValidator.validate, controller.register);

// POST /auth/login
router.post('/login', loginValidator.validate, controller.login);

// PATCH /auth/profile
router.patch('/profile', authMiddleware, updateProfileValidator.validate, controller.updateProfile);

// PATCH /auth/password
router.patch('/password', authMiddleware, updatePasswordValidator.validate, controller.updatePassword);

export default router;
