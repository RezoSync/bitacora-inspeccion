import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../types';

interface TokenPayload {
  sub: string;
  username: string;
}

export function requireAuth(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
): void {
  const authorization = request.header('Authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : undefined;

  if (!token) {
    response.status(401).json({ message: 'Authentication token is required' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    request.inspector = { id: Number(payload.sub), username: payload.username };
    next();
  } catch {
    response.status(401).json({ message: 'Invalid or expired authentication token' });
  }
}
