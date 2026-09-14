# Surekuma – Tourism Employee Social Security Fund

Full-stack reference implementation for the Surekuma application workflow. It uses React/Vite, Express, Prisma with MySQL, secure cookie-based JWT authentication, role-based access control, audit history, document metadata, and email notification tracking.

> Sections A–F have been reconciled with `Social security application.docx`. The form references Annexure 1 but does not include it, so official pension scheme options still require that annexure. No official values have been invented.

## Structure

- `client/` – React, Vite, Material UI, React Hook Form, Zod, Axios
- `server/` – Express API, Prisma, JWT, bcrypt, Nodemailer, Multer
- `database/schema.sql` – MySQL Workbench-compatible schema
- `docs/` – requirements, architecture, data model, plan, and checklist

## Prerequisites

- Node.js 20+
- MySQL 8+

## Setup

1. Create a UTF-8 database in MySQL Workbench or the MySQL CLI:

   ```sql
   CREATE DATABASE surekuma CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Copy `server/.env.example` to `server/.env` and set a strong `JWT_SECRET`, database credentials, and optional SMTP settings.
3. Install and initialize:

   ```bash
   cd server
   npm install
   npx prisma generate
   npx prisma migrate dev --name initial
   npm run seed

   cd ../client
   npm install
   npm run dev
   ```

4. In another terminal run `npm run dev` inside `server/`. The UI is served on `http://localhost:5173` and the API on `http://localhost:4000`.

Alternatively, execute `database/schema.sql` in MySQL Workbench instead of Prisma migrations. Do not use both methods against the same fresh database.

## Seed users

The seed script reads passwords from `SEED_APPLICANT_PASSWORD`, `SEED_OFFICER_PASSWORD`, and `SEED_ADMIN_PASSWORD`. It refuses to seed users unless these values are present and at least 12 characters long. Seed pension schemes are deliberately disabled placeholders and must be replaced with official Annexure 1 values.

## Commands

| Location | Command | Purpose |
|---|---|---|
| `server` | `npm run dev` | Start API in watch mode |
| `server` | `npm test` | Run workflow/auth tests |
| `server` | `npm run typecheck` | Type-check API |
| `server` | `npm run seed` | Seed roles/users and placeholder schemes |
| `client` | `npm run dev` | Start Vite |
| `client` | `npm run build` | Type-check and build UI |

Uploads are stored under `server/uploads/` and only metadata/path is stored in MySQL. In production, put the API behind HTTPS, use durable private object storage, rotate secrets, configure SMTP, and replace the placeholder schemes after obtaining Annexure 1.

The placeholder schemes are disabled intentionally, so applications cannot be submitted until official Annexure 1 schemes are loaded and marked active. `npx prisma studio` is a convenient development-only way to maintain them. The automated suite does not require MySQL; database-backed acceptance testing remains a deployment step after a target MySQL instance is configured.
