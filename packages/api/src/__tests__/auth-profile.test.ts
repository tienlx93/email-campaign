import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth.service';

vi.mock('../db', () => ({
  default: vi.fn(),
}));
vi.mock('bcryptjs');

import db from '../db';

describe('AuthService.updateProfile', () => {
  it('updates user name and returns updated user', async () => {
    const mockUser = { id: 1, email: 'a@b.com', name: 'New Name' };
    const mockQuery = {
      where: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([mockUser]),
    };
    (db as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockQuery);

    const svc = new AuthService();
    const result = await svc.updateProfile(1, { name: 'New Name' });

    expect(result).toEqual({ id: 1, email: 'a@b.com', name: 'New Name' });
  });
});

describe('AuthService.updatePassword', () => {
  it('throws 401 when current password is wrong', async () => {
    const mockUser = { id: 1, password_hash: 'hash' };
    const mockQuery = {
      where: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(mockUser),
    };
    (db as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockQuery);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const svc = new AuthService();
    await expect(svc.updatePassword(1, {
      currentPassword: 'wrong',
      newPassword: 'newpass123',
    })).rejects.toMatchObject({ statusCode: 401 });
  });

  it('hashes and saves new password when current is correct', async () => {
    const mockUser = { id: 1, password_hash: 'hash' };
    const updateMock = { where: vi.fn().mockReturnThis(), update: vi.fn().mockResolvedValue(1) };
    const findMock   = { where: vi.fn().mockReturnThis(), first: vi.fn().mockResolvedValue(mockUser) };
    (db as unknown as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(findMock)
      .mockReturnValueOnce(updateMock);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(bcrypt.hash).mockResolvedValue('new_hash' as never);

    const svc = new AuthService();
    await svc.updatePassword(1, { currentPassword: 'current', newPassword: 'newpass123' });

    expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);
    expect(updateMock.update).toHaveBeenCalledWith({ password_hash: 'new_hash' });
  });
});
