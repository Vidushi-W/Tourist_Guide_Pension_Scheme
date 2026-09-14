import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { sendTrackedEmail } from './email.service.js';

type RegisterInput = { email: string; password: string; fullName: string; nic: string; dateOfBirth: Date; phone: string; permanentAddress: string };

const publicUser = (user: { id: string; email: string; role: string; isActive: boolean }) => ({ id: user.id, email: user.email, role: user.role, isActive: user.isActive });

export async function register(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({ data: {
    email: input.email, passwordHash,
    applicantProfile: { create: { fullName: input.fullName, nic: input.nic, dateOfBirth: input.dateOfBirth, phone: input.phone, permanentAddress: input.permanentAddress } },
  } });
  return publicUser(user);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  return { user: publicUser(user), token: signSession(user) };
}

export function signSession(user: { id: string; email: string; role: string }) {
  return jwt.sign({ email: user.email, role: user.role }, env.JWT_SECRET, { subject: user.id, expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60_000) } });
  await sendTrackedEmail({ recipient: email, subject: 'Reset your Surekuma password', template: 'PASSWORD_RESET', text: `Use this one-time token within 30 minutes:\n\n${token}` });
}

export async function resetPassword(token: string, password: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt <= new Date()) throw new AppError(400, 'Reset token is invalid or expired', 'INVALID_RESET_TOKEN');
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
}

