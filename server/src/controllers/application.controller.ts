import type { Request, Response } from 'express';
import type { ApplicationStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import * as applications from '../services/application.service.js';

const userId = (req: Request) => req.user!.id;
const appId = (req: Request) => String(req.params.id);
export async function create(req: Request, res: Response) { res.status(201).json({ data: await applications.createDraft(userId(req)) }); }
export async function mine(req: Request, res: Response) { res.json({ data: await applications.listMine(userId(req)) }); }
export async function detail(req: Request, res: Response) { res.json({ data: await applications.getMine(userId(req), appId(req)) }); }
export async function update(req: Request, res: Response) { res.json({ data: await applications.updateDraft(userId(req), appId(req), req.body) }); }
export async function submit(req: Request, res: Response) { res.json({ data: await applications.submit(userId(req), appId(req)) }); }
export async function family(req: Request, res: Response) { res.status(201).json({ data: await applications.addFamily(userId(req), appId(req), req.body) }); }
export async function beneficiary(req: Request, res: Response) { res.status(201).json({ data: await applications.addBeneficiary(userId(req), appId(req), req.body) }); }
export async function document(req: Request, res: Response) {
  if (!req.file) throw new AppError(400, 'A file is required', 'FILE_REQUIRED');
  res.status(201).json({ data: await applications.addDocument(userId(req), appId(req), req.body.category, req.file) });
}
export async function schemes(_req: Request, res: Response) { res.json({ data: await prisma.pensionScheme.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }) }); }
export async function profile(req: Request, res: Response) {
  const result = await prisma.applicantProfile.findUnique({ where: { userId: userId(req) } });
  res.json({ data: result });
}
export async function updateProfile(req: Request, res: Response) {
  const result = await prisma.applicantProfile.update({ where: { userId: userId(req) }, data: req.body });
  res.json({ data: result });
}

export async function officerList(req: Request, res: Response) {
  res.json({ data: await applications.listForOfficer(req.query.status as ApplicationStatus | undefined, req.query.search as string | undefined) });
}
export async function staffDetail(req: Request, res: Response) { res.json({ data: await applications.getForStaff(appId(req)) }); }
export async function startReview(req: Request, res: Response) { res.json({ data: await applications.startReview(userId(req), appId(req)) }); }
export async function decide(req: Request, res: Response) { res.json({ data: await applications.decide(userId(req), appId(req), req.body) }); }
export async function sssbList(req: Request, res: Response) { res.json({ data: await applications.listForSssb(req.query.completed === 'true') }); }
export async function startSssb(req: Request, res: Response) { res.json({ data: await applications.startSssb(userId(req), appId(req)) }); }
export async function completeSssb(req: Request, res: Response) { res.json({ data: await applications.completeSssb(userId(req), appId(req), req.body) }); }
