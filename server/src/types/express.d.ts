import type { AppRole } from '../config/roles.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: AppRole };
    }
  }
}

export {};

