export type Role = 'APPLICANT' | 'SUBJECT_OFFICER' | 'SSSB_ADMIN';
export type Status = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CORRECTION_REQUESTED' | 'SUBJECT_OFFICER_APPROVED' | 'REJECTED' | 'SSSB_PROCESSING' | 'COMPLETED';
export type User = { id: string; email: string; role: Role };
export type ListApplication = { id: string; applicationNumber?: string; status: Status; createdAt: string; updatedAt: string; submittedAt?: string; applicantProfile?: { fullName: string; nic: string }; sssbProcessing?: unknown };
export type Application = ListApplication & {
  tourismServiceYears?: number; tourismServiceMonths?: number; currentlyRegisteredWithSltda?: boolean; sltdaRegistrationNumber?: string;
  registrationCategory?: string; otherRegistrationCategory?: string; entitledEpf: boolean; entitledEtf: boolean; entitledGovernmentPension: boolean; entitledOtherSocialSecurity: boolean; otherSocialSecurityDetails?: string;
  pensionSchemeId?: string; selectedSchemePeriodYears?: number; monthlyContributionAmount?: string; contributionStartMonth?: string;
  pensionScheme?: { id: string; name: string; code: string; totalContribution?: string }; declarationAccepted: boolean; applicantSignatureName?: string; declarationDate?: string;
  applicantProfile: { fullName: string; nic: string; dateOfBirth: string; phone: string; permanentAddress: string; divisionalSecretariat?: string; district?: string; gender?: string; nationality?: string; user?: { email: string } };
  familyMembers: Array<{ id: string; fullName: string; relationship: string; nic?: string; maritalStatus?: string }>;
  beneficiaries: Array<{ id: string; fullName: string; relationship: string; nic?: string; phone?: string }>;
  documents: Array<{ id: string; category: string; originalName: string; sizeBytes: number }>;
  officerReviews: Array<Record<string, unknown>>;
  history: Array<{ id: string; action: string; fromStatus?: Status; toStatus: Status; comment?: string; createdAt: string; actor?: { email: string; role: Role } }>;
  sssbProcessing?: Record<string, unknown>;
};
