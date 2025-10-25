import jwt from 'jsonwebtoken';
import { add, isAfter } from 'date-fns';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '15m';
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS || 30);

export interface JWTPayload {
  id: string;
  email: string;
  role?: string;
}

export const signAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const createRefreshPayload = (): { expiresAt: Date } => {
  const expiresAt = add(new Date(), { days: REFRESH_EXPIRES_DAYS });
  return { expiresAt };
};

export const isRefreshExpired = (expiresAt: Date): boolean => {
  return isAfter(new Date(), expiresAt);
};
