import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { RequestHandler } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: number; email: string };
  }
}

const jwtPayloadSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
});

export function generateToken(payload: object): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string): object {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwt.verify(token, secret) as object;
}

export const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = verifyToken(token);
    const result = jwtPayloadSchema.safeParse(decoded);
    if (!result.success) {
      throw new Error('Invalid token payload shape');
    }
    req.user = { id: result.data.id, email: result.data.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
