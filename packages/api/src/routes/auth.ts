import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { RegisterValidator, LoginValidator } from '../validators/auth.validator';

const router = Router();
const controller = new AuthController(new AuthService());
const registerValidator = new RegisterValidator();
const loginValidator = new LoginValidator();

// POST /auth/register
router.post('/register', registerValidator.validate, controller.register);

// POST /auth/login
router.post('/login', loginValidator.validate, controller.login);

export default router;
