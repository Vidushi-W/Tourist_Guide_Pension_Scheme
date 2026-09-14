import { describe, expect, it } from 'vitest';
import { assertTransition, meetsSurekumaEligibilityRule, TRANSITIONS, yearsSince } from '../src/utils/workflow.js';

describe('application submission and status policy', () => {
  it('allows a draft submission and a corrected resubmission', () => {
    expect(() => assertTransition('DRAFT', 'SUBMITTED')).not.toThrow();
    expect(() => assertTransition('CORRECTION_REQUESTED', 'SUBMITTED')).not.toThrow();
  });
  it('prevents clients from skipping review', () => {
    expect(() => assertTransition('DRAFT', 'SUBJECT_OFFICER_APPROVED')).toThrow(/Invalid status transition/);
    expect(TRANSITIONS.SUBMITTED).toEqual(['UNDER_REVIEW']);
  });
  it('allows only valid review decisions', () => {
    expect(TRANSITIONS.UNDER_REVIEW).toEqual(expect.arrayContaining(['SUBJECT_OFFICER_APPROVED', 'REJECTED', 'CORRECTION_REQUESTED']));
    expect(() => assertTransition('UNDER_REVIEW', 'COMPLETED')).toThrow();
  });
  it('requires SSSB processing before completion', () => {
    expect(() => assertTransition('SUBJECT_OFFICER_APPROVED', 'SSSB_PROCESSING')).not.toThrow();
    expect(() => assertTransition('SSSB_PROCESSING', 'COMPLETED')).not.toThrow();
  });
});

describe('five-year eligibility calculation', () => {
  it('counts completed years rather than storing age/service', () => {
    expect(yearsSince(new Date('2020-09-15T00:00:00Z'), new Date('2025-09-14T00:00:00Z'))).toBe(4);
    expect(yearsSince(new Date('2020-09-14T00:00:00Z'), new Date('2025-09-14T00:00:00Z'))).toBe(5);
  });
  it('requires five years and no listed pension/social-security entitlement', () => {
    const none = { epf: false, etf: false, governmentPension: false, otherSocialSecurity: false };
    expect(meetsSurekumaEligibilityRule(5, 0, none)).toBe(true);
    expect(meetsSurekumaEligibilityRule(4, 11, none)).toBe(false);
    expect(meetsSurekumaEligibilityRule(8, 0, { ...none, epf: true })).toBe(false);
  });
});
