# Requirements, architecture, and implementation plan

## Requirements extracted from the available material

The written specification and source Word form define three centralized roles: Applicant, Subject Officer, and SSSB Officer/Administrator. Applicants register, manage profile data, build a seven-step application, maintain family members and beneficiaries, upload evidence, accept the source declaration, submit/resubmit, and see history. Subject Officers review eligibility, record the complete Section E recommendation/contribution snapshot, and approve, reject, or request corrections. SSSB Officers add all Section F office-use data, allocate unique membership/certificate identifiers, record account opening and registration, sign/date the record, and complete approved applications.

The source form fields are: Section A—Divisional Secretariat, district, name as per NIC, NIC, date of birth, calculated age, gender, Sri Lankan nationality, permanent address, contact number, and email. Section B—tourism service years/months, current SLTDA registration and number, one of eight listed registration categories (including specified Other), family name/relationship/ID/marital status, and EPF/ETF/Government Pension/other social-security entitlements. Section C—Annexure 1 option, 1/5/10/15-year period, monthly contribution, start month, and attached scheme copy. Section D—the exact declaration, one or more beneficiary names/relationships/NIC or birth-certificate numbers/contact numbers, electronic signature name, and date. Section E—eligibility certification, 40%/60% contribution snapshots, payment start/count/end, pension start, recommending officer name/designation, approving signature/designation, and date. Section F—membership ID, certificate number, account-opened date, scheme registration, officer signature, and date.

The authoritative lifecycle is `DRAFT → SUBMITTED → UNDER_REVIEW → SUBJECT_OFFICER_APPROVED → SSSB_PROCESSING → COMPLETED`, with `UNDER_REVIEW → REJECTED` and `UNDER_REVIEW → CORRECTION_REQUESTED → SUBMITTED`. Status changes are server-only, transactional, audited, and followed by best-effort email delivery.

Core records required by the specification are users, applicant profiles, applications, family members, beneficiaries, pension schemes, officer reviews, SSSB processing, documents, application history, and email notifications. Monetary values use decimal storage; mutable scheme values are snapshotted at approval. IDs and frequently searched properties are unique/indexed. Files live outside MySQL.

## Genuine ambiguity

The supplied Word form references Annexure 1 but does not contain the annexure or its pension-scheme values. Official options therefore remain unconfigured and are not invented; the seed creates disabled placeholders. The form contains a few apparent typographical errors, so the interface preserves the substance using clear English rather than reproducing those errors verbatim. Typed full names plus timestamps are used as electronic signature records; production deployment should confirm that this signature method satisfies the authority's legal and policy requirements.

## Architecture

```text
React/Vite + MUI
  └─ Axios (credentials included)
      └─ Express REST API
          ├─ Zod validation
          ├─ JWT in HttpOnly SameSite cookie
          ├─ role/ownership middleware
          ├─ service transactions + transition policy
          ├─ Prisma ORM
          │   └─ MySQL 8 / utf8mb4
          ├─ private upload directory (metadata in MySQL)
          └─ Nodemailer + email attempt log
```

Routes are split into auth, applicant applications, pension schemes, officer review, and SSSB processing. Controllers deal with HTTP; services own workflow and transactions; schemas validate input; middleware handles authentication, authorization, errors, and uploads.

## Entities and relationships

- User 1—0..1 ApplicantProfile; User 1—many review/history actions.
- ApplicantProfile 1—many Application.
- Application many—1 PensionScheme (optional while drafting).
- Application 1—many FamilyMember, Beneficiary, Document, OfficerReview, ApplicationHistory, and EmailNotification.
- Application 1—0..1 SssbProcessing; the processing record also references its SSSB officer.
- ApplicationSequence provides concurrency-safe daily application serials.
- PasswordResetToken stores hashed, expiring, single-use reset tokens.

Deletes cascade only for true owned children. User/profile deletion is restricted when durable applications exist. Pension schemes referenced by applications cannot be deleted.

## Phased plan

1. Establish requirements, ambiguity log, architecture, schema, and project configuration.
2. Implement authentication, authorization, validation, application CRUD, ownership rules, uploads, transitions, audit history, review, and SSSB completion.
3. Implement the responsive role-aware React shell and applicant/officer/SSSB pages.
4. Add deterministic seed data, SQL schema, automated policy tests, documentation, and build/type-check verification.
