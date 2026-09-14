import { Router } from 'express';
import { z } from 'zod';
import * as controller from '../controllers/application.controller.js';
import { ROLES } from '../config/roles.js';
import { requireAuth } from '../middleware/auth.js';
import { allowRoles } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const profileUpdate = z.object({ body: z.object({
  fullName: z.string().trim().min(2).max(255).optional(), nameWithInitials: z.string().trim().max(255).nullish(),
  dateOfBirth: z.coerce.date().max(new Date()).optional(), gender: z.string().max(30).nullish(), civilStatus: z.string().max(30).nullish(),
  phone: z.string().trim().min(7).max(30).optional(), alternatePhone: z.string().max(30).nullish(), permanentAddress: z.string().min(5).max(2000).optional(),
  postalAddress: z.string().max(2000).nullish(), district: z.string().max(100).nullish(),
  divisionalSecretariat: z.string().max(191).nullish(), nationality: z.string().max(100).optional(),
}).strict() });

export const profileRouter = Router();
profileRouter.use(requireAuth, allowRoles(ROLES.APPLICANT));
profileRouter.get('/', asyncHandler(controller.profile));
profileRouter.patch('/', validate(profileUpdate), asyncHandler(controller.updateProfile));
