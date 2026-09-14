import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { applicationRouter } from './routes/application.routes.js';
import { officerRouter } from './routes/officer.routes.js';
import { profileRouter } from './routes/profile.routes.js';
import { sssbRouter } from './routes/sssb.routes.js';
import { documentRouter } from './routes/document.routes.js';
import { prisma } from './config/prisma.js';
import { requireAuth } from './middleware/auth.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ data: { status: 'ok' } }));
app.use('/api/auth', authRouter);
app.get('/api/pension-schemes', requireAuth, asyncHandler(async (_req, res) => res.json({ data: await prisma.pensionScheme.findMany({ where: { isActive: true } }) })));
app.use('/api/profile', profileRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/documents', documentRouter);
app.use('/api/officer', officerRouter);
app.use('/api/sssb', sssbRouter);

app.use(notFound);
app.use(errorHandler);
