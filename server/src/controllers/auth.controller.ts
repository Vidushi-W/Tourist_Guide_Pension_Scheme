import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import * as auth from '../services/auth.service.js';

const cookieOptions = () => ({ httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax' as const, maxAge: 8 * 60 * 60 * 1000, path: '/' });

export async function register(req: Request, res: Response) {
  const user = await auth.register(req.body);
  res.status(201).json({ data: user });
}
export async function login(req: Request, res: Response) {
  const result = await auth.login(req.body.email, req.body.password);
  res.cookie(env.COOKIE_NAME, result.token, cookieOptions()).json({ data: result.user });
}
export async function logout(_req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME, cookieOptions()).status(204).send();
}
export async function me(req: Request, res: Response) { res.json({ data: req.user }); }
export async function forgot(req: Request, res: Response) {
  await auth.requestPasswordReset(req.body.email);
  res.json({ data: { message: 'If the account exists, reset instructions have been sent.' } });
}
export async function reset(req: Request, res: Response) {
  await auth.resetPassword(req.body.token, req.body.password);
  res.json({ data: { message: 'Password updated.' } });
}

