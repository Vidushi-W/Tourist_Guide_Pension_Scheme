import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
const seeds = [
  { email: 'applicant@example.test', role: Role.APPLICANT, password: process.env.SEED_APPLICANT_PASSWORD, profile: { fullName: 'Sample Applicant', nic: 'SAMPLE-NIC-001', dateOfBirth: new Date('1990-01-01'), phone: '0700000000', permanentAddress: 'Sample address — replace before use' } },
  { email: 'officer@example.test', role: Role.SUBJECT_OFFICER, password: process.env.SEED_OFFICER_PASSWORD },
  { email: 'admin@example.test', role: Role.SSSB_ADMIN, password: process.env.SEED_ADMIN_PASSWORD },
];

async function main() {
  const missing = seeds.filter((x) => !x.password || x.password.length < 12);
  if (missing.length) throw new Error('Set all three SEED_*_PASSWORD variables to values of at least 12 characters.');
  for (const seed of seeds) {
    const passwordHash = await bcrypt.hash(seed.password!, 12);
    await prisma.user.upsert({ where: { email: seed.email }, update: { role: seed.role, passwordHash }, create: {
      email: seed.email, role: seed.role, passwordHash,
      ...(seed.profile ? { applicantProfile: { create: seed.profile } } : {}),
    } });
  }
  for (const [index, name] of ['Sample Scheme A — replace with Annexure 1', 'Sample Scheme B — replace with Annexure 1', 'Sample Scheme C — replace with Annexure 1'].entries()) {
    await prisma.pensionScheme.upsert({ where: { code: `SAMPLE-${index + 1}` }, update: {}, create: { code: `SAMPLE-${index + 1}`, name, isSample: true, isActive: false } });
  }
  console.log('Seed complete. Placeholder schemes are disabled and contain no invented contribution values.');
}

main().finally(() => prisma.$disconnect());
