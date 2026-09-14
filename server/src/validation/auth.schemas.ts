import { z } from 'zod';

const password = z.string().min(12).max(128);
export const registerSchema = z.object({ body: z.object({
  email: z.string().trim().toLowerCase().email().max(191),
  password,
  fullName: z.string().trim().min(2).max(255),
  nic: z.string().trim().min(5).max(20),
  dateOfBirth: z.coerce.date().max(new Date()),
  phone: z.string().trim().min(7).max(30),
  permanentAddress: z.string().trim().min(5).max(2000),
}) });
export const loginSchema = z.object({ body: z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(128) }) });
export const forgotSchema = z.object({ body: z.object({ email: z.string().trim().toLowerCase().email() }) });
export const resetSchema = z.object({ body: z.object({ token: z.string().min(32).max(256), password }) });

