import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db';
import { generateToken } from '../middleware/auth';
import { validate, registerSchema, loginSchema } from '../validators/schemas';

const router = Router();

// POST /auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, name, password } = req.body;

  const existing = await db('users').where({ email }).first();
  if (existing) {
    res.status(409).json({ error: 'A user with that email already exists' });
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const [user] = await db('users')
    .insert({ email, name, password_hash })
    .returning(['id', 'email', 'name', 'created_at']);

  const token = generateToken({ id: user.id, email: user.email });
  res.status(201).json({ user, token });
});

// POST /auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await db('users').where({ email }).first();
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = generateToken({ id: user.id, email: user.email });
  res.status(200).json({
    user: { id: user.id, email: user.email, name: user.name, created_at: user.created_at },
    token,
  });
});

export default router;
