import { Prisma, type ApplicationStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { assertTransition, meetsSurekumaEligibilityRule } from '../utils/workflow.js';
import { applicationEmail, sendTrackedEmail } from './email.service.js';

export const applicationInclude = {
  applicantProfile: { include: { user: { select: { email: true } } } }, pensionScheme: true, familyMembers: true,
  beneficiaries: true, documents: true, officerReviews: { orderBy: { createdAt: 'desc' as const } },
  sssbProcessing: true, history: { orderBy: { createdAt: 'asc' as const }, include: { actor: { select: { email: true, role: true } } } },
};

async function profileFor(userId: string) {
  const profile = await prisma.applicantProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError(404, 'Applicant profile not found', 'PROFILE_NOT_FOUND');
  return profile;
}

export async function createDraft(userId: string) {
  const profile = await profileFor(userId);
  return prisma.application.create({ data: { applicantProfileId: profile.id, history: { create: { toStatus: 'DRAFT', action: 'DRAFT_CREATED', actorId: userId } } }, include: applicationInclude });
}

export async function listMine(userId: string) {
  const profile = await profileFor(userId);
  return prisma.application.findMany({ where: { applicantProfileId: profile.id }, orderBy: { updatedAt: 'desc' }, select: { id: true, applicationNumber: true, status: true, createdAt: true, updatedAt: true, submittedAt: true } });
}

export async function getMine(userId: string, id: string) {
  const app = await prisma.application.findFirst({ where: { id, applicantProfile: { userId } }, include: applicationInclude });
  if (!app) throw new AppError(404, 'Application not found', 'NOT_FOUND');
  return app;
}

export async function updateDraft(userId: string, id: string, data: Record<string, unknown>) {
  const current = await getMine(userId, id);
  if (!['DRAFT', 'CORRECTION_REQUESTED'].includes(current.status)) throw new AppError(409, 'Only drafts or returned applications can be edited', 'NOT_EDITABLE');
  const declarationAccepted = data.declarationAccepted as boolean | undefined;
  return prisma.application.update({ where: { id }, data: {
    ...(data as Prisma.ApplicationUpdateInput),
    declarationAcceptedAt: declarationAccepted === true ? new Date() : declarationAccepted === false ? null : undefined,
    version: { increment: 1 },
  }, include: applicationInclude });
}

export async function addFamily(userId: string, id: string, data: Prisma.FamilyMemberUncheckedCreateWithoutApplicationInput) {
  await assertEditableOwned(userId, id);
  return prisma.familyMember.create({ data: { ...data, applicationId: id } });
}

export async function addBeneficiary(userId: string, id: string, data: Prisma.BeneficiaryUncheckedCreateWithoutApplicationInput) {
  await assertEditableOwned(userId, id);
  return prisma.beneficiary.create({ data: { ...data, applicationId: id } });
}

export async function addDocument(userId: string, id: string, category: string, file: Express.Multer.File) {
  await assertEditableOwned(userId, id);
  return prisma.document.create({ data: { applicationId: id, category, originalName: file.originalname, storedName: file.filename, storagePath: file.path, mimeType: file.mimetype, sizeBytes: file.size } });
}

async function assertEditableOwned(userId: string, id: string) {
  const app = await getMine(userId, id);
  if (!['DRAFT', 'CORRECTION_REQUESTED'].includes(app.status)) throw new AppError(409, 'Application is not editable', 'NOT_EDITABLE');
  return app;
}

function validateSubmission(app: Awaited<ReturnType<typeof getMine>>) {
  const missing: string[] = [];
  if (!app.applicantProfile.divisionalSecretariat) missing.push('divisionalSecretariat');
  if (!app.applicantProfile.district) missing.push('district');
  if (!app.applicantProfile.gender) missing.push('gender');
  if (!app.applicantProfile.nationality) missing.push('nationality');
  if (app.tourismServiceYears == null) missing.push('tourismServiceYears');
  if (app.tourismServiceMonths == null) missing.push('tourismServiceMonths');
  if (app.currentlyRegisteredWithSltda == null) missing.push('currentlyRegisteredWithSltda');
  if (app.currentlyRegisteredWithSltda && !app.sltdaRegistrationNumber) missing.push('sltdaRegistrationNumber');
  if (!app.registrationCategory) missing.push('registrationCategory');
  if (app.registrationCategory === 'OTHER' && !app.otherRegistrationCategory) missing.push('otherRegistrationCategory');
  if (app.entitledOtherSocialSecurity && !app.otherSocialSecurityDetails) missing.push('otherSocialSecurityDetails');
  if (!app.pensionSchemeId) missing.push('pensionSchemeId');
  if (!app.selectedSchemePeriodYears) missing.push('selectedSchemePeriodYears');
  if (!app.monthlyContributionAmount) missing.push('monthlyContributionAmount');
  if (!app.contributionStartMonth) missing.push('contributionStartMonth');
  if (!app.declarationAccepted) missing.push('declarationAccepted');
  if (!app.applicantSignatureName) missing.push('applicantSignatureName');
  if (!app.declarationDate) missing.push('declarationDate');
  if (!app.beneficiaries.length) missing.push('beneficiaries');
  if (!app.documents.some((document) => document.category === 'SELECTED_SCHEME_COPY')) missing.push('selectedSchemeCopy');
  if (app.pensionScheme && !app.pensionScheme.isActive) missing.push('activePensionScheme');
  if (missing.length) throw new AppError(400, 'Application is incomplete', 'INCOMPLETE_APPLICATION', { missing });
}

export async function submit(userId: string, id: string) {
  const current = await assertEditableOwned(userId, id);
  validateSubmission(current);
  const result = await prisma.$transaction(async (tx) => {
    const locked = await tx.application.findUniqueOrThrow({ where: { id } });
    const target: ApplicationStatus = 'SUBMITTED';
    assertTransition(locked.status, target);
    let applicationNumber = locked.applicationNumber;
    if (!applicationNumber) {
      const dateKey = new Date().toISOString().slice(0, 10).replaceAll('-', '');
      const sequence = await tx.applicationSequence.upsert({ where: { dateKey }, create: { dateKey, currentValue: 1 }, update: { currentValue: { increment: 1 } } });
      applicationNumber = `SUR-${dateKey}-${String(sequence.currentValue).padStart(6, '0')}`;
    }
    const now = new Date();
    const application = await tx.application.update({ where: { id }, data: { status: target, applicationNumber, submittedAt: now, version: { increment: 1 } }, include: applicationInclude });
    await tx.applicationHistory.create({ data: { applicationId: id, fromStatus: locked.status, toStatus: target, action: locked.status === 'DRAFT' ? 'SUBMITTED' : 'RESUBMITTED', actorId: userId } });
    return application;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  const mail = applicationEmail('SUBMITTED', result.applicantProfile.fullName, result.applicationNumber!, new Date());
  void sendTrackedEmail({ applicationId: id, recipient: result.applicantProfile.user.email, template: 'SUBMITTED', ...mail });
  return result;
}

export async function listForOfficer(status?: ApplicationStatus, search?: string) {
  return prisma.application.findMany({ where: {
    status: status ? status : { in: ['SUBMITTED', 'UNDER_REVIEW', 'CORRECTION_REQUESTED', 'SUBJECT_OFFICER_APPROVED', 'REJECTED'] },
    ...(search ? { OR: [{ applicationNumber: { contains: search } }, { applicantProfile: { fullName: { contains: search } } }, { applicantProfile: { nic: { contains: search } } }] } : {}),
  }, include: { applicantProfile: true, pensionScheme: true }, orderBy: { submittedAt: 'desc' } });
}

export async function getForStaff(id: string) {
  const app = await prisma.application.findUnique({ where: { id }, include: applicationInclude });
  if (!app) throw new AppError(404, 'Application not found', 'NOT_FOUND');
  return app;
}

export async function startReview(officerId: string, id: string) {
  return prisma.$transaction(async (tx) => {
    const app = await tx.application.findUniqueOrThrow({ where: { id } });
    assertTransition(app.status, 'UNDER_REVIEW');
    const changed = await tx.application.updateMany({ where: { id, status: app.status }, data: { status: 'UNDER_REVIEW' } });
    if (changed.count !== 1) throw new AppError(409, 'Application status changed; reload and try again', 'STATUS_CONFLICT');
    await tx.officerReview.create({ data: { applicationId: id, officerId } });
    await tx.applicationHistory.create({ data: { applicationId: id, fromStatus: app.status, toStatus: 'UNDER_REVIEW', action: 'REVIEW_STARTED', actorId: officerId } });
    return tx.application.findUniqueOrThrow({ where: { id } });
  });
}

type DecisionInput = { decision: 'APPROVE' | 'REJECT' | 'REQUEST_CORRECTION'; eligible: boolean; eligibilityOverrideReason?: string | null; recommendation?: string | null; reason?: string | null; approvedTotalContribution?: number | null; paymentStartMonth?: Date | null; paymentMonthCount?: number | null; paymentEndMonth?: Date | null; pensionStartMonth?: Date | null; recommendingOfficerName?: string | null; recommendingOfficerDesignation?: string | null; approvedOfficerSignatureName?: string | null; approvedOfficerDesignation?: string | null; recommendationDate?: Date | null };

export async function decide(officerId: string, id: string, input: DecisionInput) {
  const target: ApplicationStatus = input.decision === 'APPROVE' ? 'SUBJECT_OFFICER_APPROVED' : input.decision === 'REJECT' ? 'REJECTED' : 'CORRECTION_REQUESTED';
  const result = await prisma.$transaction(async (tx) => {
    const app = await tx.application.findUnique({ where: { id }, include: { applicantProfile: { include: { user: true } }, pensionScheme: true } });
    if (!app) throw new AppError(404, 'Application not found', 'NOT_FOUND');
    assertTransition(app.status, target);
    if (app.tourismServiceYears == null || app.tourismServiceMonths == null) throw new AppError(400, 'Tourism service length is missing', 'INCOMPLETE_APPLICATION');
    const eligibilityYears = app.tourismServiceYears + app.tourismServiceMonths / 12;
    const meetsRule = meetsSurekumaEligibilityRule(app.tourismServiceYears, app.tourismServiceMonths, {
      epf: app.entitledEpf, etf: app.entitledEtf, governmentPension: app.entitledGovernmentPension, otherSocialSecurity: app.entitledOtherSocialSecurity,
    });
    if (input.eligible !== meetsRule && !input.eligibilityOverrideReason) throw new AppError(400, 'Officer eligibility override requires a reason', 'OVERRIDE_REASON_REQUIRED');
    const total = input.approvedTotalContribution ?? (app.monthlyContributionAmount ? Number(app.monthlyContributionAmount) : null);
    if (target === 'SUBJECT_OFFICER_APPROVED' && total == null) throw new AppError(400, 'Approved total contribution is required', 'CONTRIBUTION_REQUIRED');
    const sltda = total == null ? null : new Prisma.Decimal(total * env.SLTDA_CONTRIBUTION_PERCENT / 100);
    const applicant = total == null ? null : new Prisma.Decimal(total * env.APPLICANT_CONTRIBUTION_PERCENT / 100);
    await tx.officerReview.create({ data: { applicationId: id, officerId, eligible: input.eligible, eligibilityYears,
      eligibilityOverrideReason: input.eligibilityOverrideReason, recommendation: input.recommendation, decisionReason: input.reason,
      approvedTotalContribution: total, approvedSltdaContribution: sltda, approvedApplicantContribution: applicant, decision: input.decision,
      paymentStartMonth: input.paymentStartMonth, paymentMonthCount: input.paymentMonthCount, paymentEndMonth: input.paymentEndMonth,
      pensionStartMonth: input.pensionStartMonth, recommendingOfficerName: input.recommendingOfficerName,
      recommendingOfficerDesignation: input.recommendingOfficerDesignation, approvedOfficerSignatureName: input.approvedOfficerSignatureName,
      approvedOfficerDesignation: input.approvedOfficerDesignation, recommendationDate: input.recommendationDate } });
    const now = new Date();
    const changed = await tx.application.updateMany({ where: { id, status: app.status }, data: { status: target, approvedAt: target === 'SUBJECT_OFFICER_APPROVED' ? now : undefined } });
    if (changed.count !== 1) throw new AppError(409, 'Application status changed; reload and try again', 'STATUS_CONFLICT');
    await tx.applicationHistory.create({ data: { applicationId: id, fromStatus: app.status, toStatus: target, action: input.decision, comment: input.reason ?? input.recommendation, actorId: officerId } });
    return { ...app, status: target, applicationNumber: app.applicationNumber!, approvedAt: now };
  });
  const mail = applicationEmail(target, result.applicantProfile.fullName, result.applicationNumber, new Date(), input.reason ?? undefined);
  void sendTrackedEmail({ applicationId: id, recipient: result.applicantProfile.user.email, template: target, ...mail });
  return result;
}

export async function listForSssb(completed = false) {
  return prisma.application.findMany({ where: { status: completed ? 'COMPLETED' : { in: ['SUBJECT_OFFICER_APPROVED', 'SSSB_PROCESSING'] } }, include: { applicantProfile: true, sssbProcessing: true }, orderBy: { approvedAt: 'desc' } });
}

export async function startSssb(actorId: string, id: string) {
  return prisma.$transaction(async (tx) => {
    const app = await tx.application.findUniqueOrThrow({ where: { id } });
    assertTransition(app.status, 'SSSB_PROCESSING');
    const changed = await tx.application.updateMany({ where: { id, status: app.status }, data: { status: 'SSSB_PROCESSING' } });
    if (changed.count !== 1) throw new AppError(409, 'Application status changed; reload and try again', 'STATUS_CONFLICT');
    await tx.applicationHistory.create({ data: { applicationId: id, fromStatus: app.status, toStatus: 'SSSB_PROCESSING', action: 'SSSB_PROCESSING_STARTED', actorId } });
    return tx.application.findUniqueOrThrow({ where: { id } });
  });
}

export async function completeSssb(actorId: string, id: string, input: { membershipId: string; certificateNumber: string; accountOpeningDate: Date; schemeRegistered: boolean; officeRemarks?: string | null; officerSignatureName: string; processingDate: Date }) {
  const result = await prisma.$transaction(async (tx) => {
    const app = await tx.application.findUnique({ where: { id }, include: { applicantProfile: { include: { user: true } } } });
    if (!app) throw new AppError(404, 'Application not found', 'NOT_FOUND');
    assertTransition(app.status, 'COMPLETED');
    await tx.sssbProcessing.create({ data: { applicationId: id, processedById: actorId, ...input } });
    const now = new Date();
    const changed = await tx.application.updateMany({ where: { id, status: app.status }, data: { status: 'COMPLETED', completedAt: now } });
    if (changed.count !== 1) throw new AppError(409, 'Application status changed; reload and try again', 'STATUS_CONFLICT');
    await tx.applicationHistory.create({ data: { applicationId: id, fromStatus: app.status, toStatus: 'COMPLETED', action: 'COMPLETED', actorId } });
    return { ...app, status: 'COMPLETED' as const, completedAt: now };
  });
  const mail = applicationEmail('COMPLETED', result.applicantProfile.fullName, result.applicationNumber!, new Date());
  void sendTrackedEmail({ applicationId: id, recipient: result.applicantProfile.user.email, template: 'COMPLETED', ...mail });
  return result;
}
