import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRole } from '@prisma/client';

export interface Context {
  req: Request;
  res: Response;
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const createContext = ({ req, res }: { req: Request; res: Response }): Context => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  let user;
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      // Invalid token, user will be undefined
    }
  }

  return { req, res, user };
};

