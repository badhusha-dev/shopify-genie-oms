import { PrismaClient } from '@prisma/client';
import {
  registerUser,
  verifyCredentials,
  issueTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  createPasswordResetToken,
  resetPassword,
} from '../services/auth.service';

const prisma = new PrismaClient();

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const user = await prisma.user.findUnique({
        where: { id: context.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    },
  },

  Mutation: {
    register: async (_: any, args: any) => {
      const user = await registerUser({
        email: args.email,
        password: args.password,
        firstName: args.firstName,
        lastName: args.lastName,
        role: args.role,
      });

      const tokens = await issueTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    },

    login: async (_: any, args: { email: string; password: string }) => {
      const user = await verifyCredentials({
        email: args.email,
        password: args.password,
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const tokens = await issueTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    },

    refreshToken: async (_: any, args: { refreshToken: string }) => {
      const dbToken = await prisma.refreshToken.findUnique({
        where: { token: args.refreshToken },
        include: { user: true },
      });

      if (!dbToken || dbToken.revoked) {
        throw new Error('Invalid refresh token');
      }

      if (dbToken.expiresAt < new Date()) {
        throw new Error('Refresh token expired');
      }

      const rotated = await rotateRefreshToken(args.refreshToken, dbToken.userId);
      const user = dbToken.user;

      return {
        ...rotated,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    },

    logout: async (_: any, args: { refreshToken: string }) => {
      await revokeRefreshToken(args.refreshToken);
      return true;
    },

    requestPasswordReset: async (_: any, args: { email: string }) => {
      const token = await createPasswordResetToken(args.email);
      
      if (token) {
        // TODO: Send email with reset link
        // For now, just log it (in production, send via email service)
        console.log(`Password reset token for ${args.email}: ${token}`);
        console.log(`Reset URL: ${process.env.FRONTEND_URL}/reset-password?token=${token}`);
      }

      // Always return true to not reveal if user exists
      return true;
    },

    resetPassword: async (_: any, args: { token: string; newPassword: string }) => {
      await resetPassword(args.token, args.newPassword);
      return true;
    },
  },
};

