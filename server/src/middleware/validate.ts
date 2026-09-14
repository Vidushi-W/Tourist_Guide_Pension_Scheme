import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schema: ZodTypeAny): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) return next(new AppError(400, 'Validation failed', 'VALIDATION_ERROR', result.error.flatten()));
  Object.assign(req, result.data);
  next();
};

