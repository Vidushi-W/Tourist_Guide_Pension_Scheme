import { mkdir } from 'node:fs/promises';
import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

await mkdir(env.UPLOAD_DIR, { recursive: true });
const server = app.listen(env.PORT, () => console.log(`Surekuma API listening on http://localhost:${env.PORT}`));

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

