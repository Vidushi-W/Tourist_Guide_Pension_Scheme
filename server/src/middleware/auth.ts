import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AppRole } from '../config/roles.js';
import { AppError } from '../utils/AppError.js';

type Claims = { sub: string; email: string; role: AppRole };

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) return next(new AppError(401, 'Authentication required', 'UNAUTHENTICATED'));
  try {
    const claims = jwt.verify(token, env.JWT_SECRET) as Claims;
    req.user = { id: claims.sub, email: claims.email, role: claims.role };
    next();
  } catch {
    next(new AppError(401, 'Session is invalid or expired', 'INVALID_SESSION'));
  }
};

