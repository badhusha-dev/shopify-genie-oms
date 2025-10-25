import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { signAccessToken, createRefreshPayload } from '../utils/jwt';
import { add } from 'date-fns';

const prisma = new PrismaClient();

export interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'MANAGER' | 'FULFILLMENT' | 'SUPPORT';
}

export interface VerifyCredentialsInput {
  email: string;
  password: string;
}

export interface IssueTokensResponse {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

/**
 * Register a new user
 */
export async function registerUser(input: RegisterUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  
  if (existing) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role || 'SUPPORT',
    },
  });

  return user;
}

/**
 * Verify user credentials
 */
export async function verifyCredentials(input: VerifyCredentialsInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(input.password, user.password);

  if (!isValid) {
    return null;
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('User account is disabled');
  }

  return user;
}

/**
 * Issue access + refresh tokens
 */
export async function issueTokens(user: { id: string; email: string; role: string }): Promise<IssueTokensResponse> {
  const accessToken = signAccessToken({ 
    id: user.id, 
    email: user.email,
    role: user.role 
  });

  // Create refresh token
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = add(new Date(), { days: Number(process.env.REFRESH_EXPIRES_DAYS || 30) });

  const dbToken = await prisma.refreshToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
      meta: {},
    },
  });

  return { 
    accessToken, 
    refreshToken: token, 
    refreshExpiresAt: dbToken.expiresAt 
  };
}

/**
 * Revoke a refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({ 
    where: { token }, 
    data: { revoked: true } 
  });
}

/**
 * Rotate refresh token (revoke old, issue new)
 */
export async function rotateRefreshToken(oldToken: string, userId: string): Promise<IssueTokensResponse> {
  // Revoke old token
  await revokeRefreshToken(oldToken);

  // Create new refresh token
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = add(new Date(), { days: Number(process.env.REFRESH_EXPIRES_DAYS || 30) });

  const newToken = await prisma.refreshToken.create({
    data: { token, userId, expiresAt, meta: {} },
  });

  // Get user for access token
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    throw new Error('User not found');
  }

  const accessToken = signAccessToken({ 
    id: user.id, 
    email: user.email,
    role: user.role 
  });

  return { 
    accessToken, 
    refreshToken: newToken.token, 
    refreshExpiresAt: newToken.expiresAt 
  };
}

/**
 * Create password reset token
 */
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Don't reveal that user doesn't exist
    return null;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = add(new Date(), { hours: 2 });

  await prisma.passwordReset.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  return token;
}

/**
 * Reset password using token
 */
export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const resetEntry = await prisma.passwordReset.findUnique({ 
    where: { token },
    include: { user: true }
  });

  if (!resetEntry || resetEntry.used) {
    throw new Error('Invalid or expired reset token');
  }

  if (resetEntry.expiresAt < new Date()) {
    throw new Error('Reset token has expired');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: resetEntry.userId },
    data: { password: hashedPassword },
  });

  await prisma.passwordReset.update({
    where: { token },
    data: { used: true },
  });

  return true;
}

/**
 * Cleanup expired refresh tokens (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revoked: true }
      ]
    }
  });

  return result.count;
}
