import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ITokens } from '../types';
import dotenv from 'dotenv';

dotenv.config();


const JWT_ACCESS_SECRET: Secret = process.env.JWT_ACCESS_SECRET as string;
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET as string;

if (!JWT_ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
}

if (!JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
}

export const generateTokens = (userId: Types.ObjectId, role: string, email: string): ITokens => {
  const accessToken = jwt.sign(
    { userId, role, email },
    JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' } as SignOptions
  );

  const refreshToken = jwt.sign(
    { userId, role, email },
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' } as SignOptions
  );

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as any;
  } catch (error) {
    return null;
  }
};