import { z } from 'zod';

export const idParams = z.object({ params: z.object({ id: z.string().uuid() }) });
export const applicationUpdateSchema = idParams.extend({ body: z.object({
  tourismServiceYears: z.coerce.number().int().min(0).max(80).nullish(),
  tourismServiceMonths: z.coerce.number().int().min(0).max(11).nullish(),
  currentlyRegisteredWithSltda: z.boolean().nullish(),
  sltdaRegistrationNumber: z.string().trim().max(100).nullish(),
  registrationCategory: z.enum(['HOMESTAY', 'BUNGALOW', 'TOURIST_HOTEL', 'RENTED_APARTMENT', 'TOURIST_GUIDE_LECTURER', 'TRAVEL_AGENT', 'TOURIST_DRIVER', 'OTHER']).nullish(),
  otherRegistrationCategory: z.string().trim().max(191).nullish(),
  entitledEpf: z.boolean().optional(), entitledEtf: z.boolean().optional(), entitledGovernmentPension: z.boolean().optional(), entitledOtherSocialSecurity: z.boolean().optional(),
  otherSocialSecurityDetails: z.string().trim().max(255).nullish(),
  pensionSchemeId: z.string().uuid().nullish(),
  selectedSchemePeriodYears: z.coerce.number().int().refine((v) => [1, 5, 10, 15].includes(v), 'Select a period shown on the form').nullish(),
  monthlyContributionAmount: z.coerce.number().positive().nullish(),
  contributionStartMonth: z.coerce.date().nullish(),
  declarationAccepted: z.boolean().optional(),
  applicantSignatureName: z.string().trim().max(255).nullish(),
  declarationDate: z.coerce.date().max(new Date()).nullish(),
  additionalFormData: z.record(z.unknown()).nullish(),
}).strict() });

export const familySchema = idParams.extend({ body: z.object({
  fullName: z.string().trim().min(2).max(255), relationship: z.string().trim().min(1).max(100),
  nic: z.string().trim().max(20).nullish(), dateOfBirth: z.coerce.date().max(new Date()).nullish(), occupation: z.string().trim().max(191).nullish(), maritalStatus: z.string().trim().max(50).nullish(),
}) });
export const beneficiarySchema = idParams.extend({ body: z.object({
  fullName: z.string().trim().min(2).max(255), relationship: z.string().trim().min(1).max(100),
  nic: z.string().trim().max(20).nullish(), dateOfBirth: z.coerce.date().max(new Date()).nullish(), address: z.string().max(2000).nullish(), phone: z.string().max(30).nullish(),
  allocationPercent: z.coerce.number().min(0).max(100).nullish(),
}) });
export const documentSchema = idParams.extend({ body: z.object({ category: z.string().trim().min(1).max(100) }) });
export const decisionSchema = idParams.extend({ body: z.object({
  decision: z.enum(['APPROVE', 'REJECT', 'REQUEST_CORRECTION']),
  eligible: z.boolean(),
  eligibilityOverrideReason: z.string().trim().max(2000).nullish(),
  recommendation: z.string().trim().max(4000).nullish(),
  reason: z.string().trim().max(4000).nullish(),
  approvedTotalContribution: z.coerce.number().positive().nullish(),
  paymentStartMonth: z.coerce.date().nullish(), paymentMonthCount: z.coerce.number().int().positive().nullish(), paymentEndMonth: z.coerce.date().nullish(), pensionStartMonth: z.coerce.date().nullish(),
  recommendingOfficerName: z.string().trim().max(255).nullish(), recommendingOfficerDesignation: z.string().trim().max(191).nullish(),
  approvedOfficerSignatureName: z.string().trim().max(255).nullish(), approvedOfficerDesignation: z.string().trim().max(191).nullish(), recommendationDate: z.coerce.date().max(new Date()).nullish(),
}).superRefine((value, ctx) => {
  if (value.decision !== 'APPROVE' && !value.reason) ctx.addIssue({ code: 'custom', path: ['reason'], message: 'A reason is required' });
  if (!value.eligible && value.decision === 'APPROVE' && !value.eligibilityOverrideReason) ctx.addIssue({ code: 'custom', path: ['eligibilityOverrideReason'], message: 'Override reason is required' });
  if (value.decision === 'APPROVE') for (const key of ['paymentStartMonth','paymentMonthCount','paymentEndMonth','pensionStartMonth','recommendingOfficerName','recommendingOfficerDesignation','approvedOfficerSignatureName','approvedOfficerDesignation','recommendationDate'] as const) if (!value[key]) ctx.addIssue({ code: 'custom', path: [key], message: 'Required for SLTDA recommendation' });
}) });
export const sssbSchema = idParams.extend({ body: z.object({
  membershipId: z.string().trim().min(1).max(100), certificateNumber: z.string().trim().min(1).max(100),
  accountOpeningDate: z.coerce.date().max(new Date()), schemeRegistered: z.boolean(), officeRemarks: z.string().trim().max(4000).nullish(),
  officerSignatureName: z.string().trim().min(2).max(255), processingDate: z.coerce.date().max(new Date()),
}) });
