import nodemailer from 'nodemailer';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

type EmailInput = { applicationId?: string; recipient: string; subject: string; template: string; text: string };

export async function sendTrackedEmail(input: EmailInput) {
  const record = await prisma.emailNotification.create({ data: {
    applicationId: input.applicationId, recipient: input.recipient, subject: input.subject, template: input.template,
  } });
  if (!env.SMTP_HOST) {
    await prisma.emailNotification.update({ where: { id: record.id }, data: { status: 'FAILED', errorMessage: 'SMTP is not configured' } });
    return;
  }
  try {
    const transport = nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined });
    await transport.sendMail({ from: env.EMAIL_FROM, to: input.recipient, subject: input.subject, text: input.text });
    await prisma.emailNotification.update({ where: { id: record.id }, data: { status: 'SENT', sentAt: new Date() } });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 2000) : 'Unknown email error';
    await prisma.emailNotification.update({ where: { id: record.id }, data: { status: 'FAILED', errorMessage: message } });
  }
}

export function applicationEmail(kind: string, name: string, number: string, date: Date, comment?: string) {
  const formatted = date.toISOString().slice(0, 10);
  const titles: Record<string, string> = {
    SUBMITTED: 'Surekuma Application Submitted', SUBJECT_OFFICER_APPROVED: 'Surekuma Application Approved',
    REJECTED: 'Surekuma Application Rejected', CORRECTION_REQUESTED: 'Surekuma Application Requires Corrections',
    COMPLETED: 'Surekuma Application Completed',
  };
  const subject = titles[kind] ?? 'Surekuma Application Update';
  const approval = kind === 'SUBJECT_OFFICER_APPROVED'
    ? `Your application for the Tourism Employee Social Security Fund – “Surekuma” has been reviewed and approved by the Subject Officer.\n\nApplication Number: ${number}\nApproved Date: ${formatted}\n\nYour application will now be forwarded to the next stage of processing. You can log in to the Surekuma system to check its latest status.`
    : `The status of your Surekuma application ${number} is now ${kind.replaceAll('_', ' ')} on ${formatted}.${comment ? `\n\nComment: ${comment}` : ''}`;
  return { subject, text: `Dear ${name},\n\n${approval}\n\nRegards,\nTourism Employee Social Security Fund – Surekuma` };
}

