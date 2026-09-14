import { Router } from 'express';
import * as controller from '../controllers/application.controller.js';
import { ROLES } from '../config/roles.js';
import { requireAuth } from '../middleware/auth.js';
import { allowRoles } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { idParams, sssbSchema } from '../validation/application.schemas.js';

export const sssbRouter = Router();
sssbRouter.use(requireAuth, allowRoles(ROLES.SSSB_ADMIN));
sssbRouter.get('/applications', asyncHandler(controller.sssbList));
sssbRouter.get('/applications/:id', validate(idParams), asyncHandler(controller.staffDetail));
sssbRouter.post('/applications/:id/start', validate(idParams), asyncHandler(controller.startSssb));
sssbRouter.post('/applications/:id/complete', validate(sssbSchema), asyncHandler(controller.completeSssb));

