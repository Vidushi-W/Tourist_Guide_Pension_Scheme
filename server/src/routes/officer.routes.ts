import { Router } from 'express';
import * as controller from '../controllers/application.controller.js';
import { ROLES } from '../config/roles.js';
import { requireAuth } from '../middleware/auth.js';
import { allowRoles } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { decisionSchema, idParams } from '../validation/application.schemas.js';

export const officerRouter = Router();
officerRouter.use(requireAuth, allowRoles(ROLES.SUBJECT_OFFICER));
officerRouter.get('/applications', asyncHandler(controller.officerList));
officerRouter.get('/applications/:id', validate(idParams), asyncHandler(controller.staffDetail));
officerRouter.post('/applications/:id/start-review', validate(idParams), asyncHandler(controller.startReview));
officerRouter.post('/applications/:id/decision', validate(decisionSchema), asyncHandler(controller.decide));

