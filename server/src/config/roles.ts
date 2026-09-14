export const ROLES = {
  APPLICANT: 'APPLICANT',
  SUBJECT_OFFICER: 'SUBJECT_OFFICER',
  SSSB_ADMIN: 'SSSB_ADMIN',
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<AppRole, string> = {
  APPLICANT: 'Applicant',
  SUBJECT_OFFICER: 'Subject Officer',
  SSSB_ADMIN: 'SSSB Officer / Administrator',
};

