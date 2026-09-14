import type { ApplicationStatus } from '@prisma/client';
import { AppError } from './AppError.js';

export const TRANSITIONS: Readonly<Record<ApplicationStatus, readonly ApplicationStatus[]>> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['SUBJECT_OFFICER_APPROVED', 'REJECTED', 'CORRECTION_REQUESTED'],
  CORRECTION_REQUESTED: ['SUBMITTED'],
  SUBJECT_OFFICER_APPROVED: ['SSSB_PROCESSING'],
  REJECTED: [],
  SSSB_PROCESSING: ['COMPLETED'],
  COMPLETED: [],
};

export function assertTransition(from: ApplicationStatus, to: ApplicationStatus) {
  if (!TRANSITIONS[from].includes(to)) {
    throw new AppError(409, `Invalid status transition: ${from} → ${to}`, 'INVALID_TRANSITION');
  }
}

export function yearsSince(date: Date, now = new Date()) {
  let years = now.getUTCFullYear() - date.getUTCFullYear();
  const anniversaryPending =
    now.getUTCMonth() < date.getUTCMonth() ||
    (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() < date.getUTCDate());
  if (anniversaryPending) years -= 1;
  return years;
}

export function meetsSurekumaEligibilityRule(
  years: number,
  months: number,
  entitlements: { epf: boolean; etf: boolean; governmentPension: boolean; otherSocialSecurity: boolean },
) {
  const hasFiveYears = years + months / 12 >= 5;
  const hasExcludedBenefit = Object.values(entitlements).some(Boolean);
  return hasFiveYears && !hasExcludedBenefit;
}
