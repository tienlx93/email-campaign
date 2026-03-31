import bcrypt from 'bcryptjs';
import db from '../db';
import { generateToken } from '../middleware/auth';
import { ServiceError } from '../errors/ServiceError';
import type { RegisterDto, LoginDto, UpdateProfileDto, UpdatePasswordDto } from '../validators/auth.validator';

export class AuthService {
  async register(dto: RegisterDto) {
    const existing = await db('users').where({ email: dto.email }).first();
    if (existing) {
      throw new ServiceError(409, 'A user with that email already exists');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);
    const [row] = await db('users')
      .insert({ email: dto.email, name: dto.name, password_hash })
      .returning(['id', 'email', 'name', 'created_at']);

    const token = generateToken({ id: row.id, email: row.email });
    return {
      user: { id: row.id, email: row.email, name: row.name, created_at: row.created_at },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await db('users').where({ email: dto.email }).first();
    if (!user) {
      throw new ServiceError(401, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) {
      throw new ServiceError(401, 'Invalid email or password');
    }

    const token = generateToken({ id: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, name: user.name, created_at: user.created_at },
      token,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const [user] = await db('users')
      .where({ id: userId })
      .update({ name: dto.name })
      .returning(['id', 'email', 'name']);
    return user;
  }

  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    const user = await db('users').where({ id: userId }).first();
    const valid = await bcrypt.compare(dto.currentPassword, user.password_hash);
    if (!valid) {
      throw new ServiceError(401, 'Current password is incorrect');
    }
    const password_hash = await bcrypt.hash(dto.newPassword, 10);
    await db('users').where({ id: userId }).update({ password_hash });
  }
}
