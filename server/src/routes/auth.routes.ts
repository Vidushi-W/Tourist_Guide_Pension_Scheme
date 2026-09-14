import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { forgotSchema, loginSchema, registerSchema, resetSchema } from '../validation/auth.schemas.js';

export const authRouter = Router();
authRouter.post('/register', validate(registerSchema), asyncHandler(controller.register));
authRouter.post('/login', validate(loginSchema), asyncHandler(controller.login));
authRouter.post('/logout', asyncHandler(controller.logout));
authRouter.get('/me', requireAuth, asyncHandler(controller.me));
authRouter.post('/forgot-password', validate(forgotSchema), asyncHandler(controller.forgot));
authRouter.post('/reset-password', validate(resetSchema), asyncHandler(controller.reset));

