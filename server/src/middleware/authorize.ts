import type { RequestHandler } from 'express';
import type { AppRole } from '../config/roles.js';
import { AppError } from '../utils/AppError.js';

export const allowRoles = (...roles: AppRole[]): RequestHandler => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, 'You do not have permission for this action', 'FORBIDDEN'));
  }
  next();
};

