import path from 'node:path';
import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { idParams } from '../validation/application.schemas.js';

export const documentRouter = Router();
documentRouter.use(requireAuth);
documentRouter.get('/:id/download', validate(idParams), asyncHandler(async (req, res) => {
  const document = await prisma.document.findUnique({ where: { id: String(req.params.id) }, include: { application: { include: { applicantProfile: true } } } });
  if (!document) throw new AppError(404, 'Document not found', 'NOT_FOUND');
  if (req.user!.role === 'APPLICANT' && document.application.applicantProfile.userId !== req.user!.id) {
    throw new AppError(404, 'Document not found', 'NOT_FOUND');
  }
  const uploadRoot = path.resolve(env.UPLOAD_DIR);
  const resolved = path.resolve(document.storagePath);
  if (!resolved.startsWith(`${uploadRoot}${path.sep}`)) throw new AppError(500, 'Stored document path is invalid', 'INVALID_STORAGE_PATH');
  res.download(resolved, document.originalName);
}));

