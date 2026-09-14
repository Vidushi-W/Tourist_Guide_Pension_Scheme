import { Router } from 'express';
import * as controller from '../controllers/application.controller.js';
import { ROLES } from '../config/roles.js';
import { requireAuth } from '../middleware/auth.js';
import { allowRoles } from '../middleware/authorize.js';
import { uploadOne } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { applicationUpdateSchema, beneficiarySchema, documentSchema, familySchema, idParams } from '../validation/application.schemas.js';

export const applicationRouter = Router();
applicationRouter.use(requireAuth, allowRoles(ROLES.APPLICANT));
applicationRouter.get('/', asyncHandler(controller.mine));
applicationRouter.post('/', asyncHandler(controller.create));
applicationRouter.get('/:id', validate(idParams), asyncHandler(controller.detail));
applicationRouter.patch('/:id', validate(applicationUpdateSchema), asyncHandler(controller.update));
applicationRouter.post('/:id/submit', validate(idParams), asyncHandler(controller.submit));
applicationRouter.post('/:id/family-members', validate(familySchema), asyncHandler(controller.family));
applicationRouter.post('/:id/beneficiaries', validate(beneficiarySchema), asyncHandler(controller.beneficiary));
applicationRouter.post('/:id/documents', uploadOne, validate(documentSchema), asyncHandler(controller.document));

