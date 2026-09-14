import { Chip } from '@mui/material';
import type { Status } from '../types';

const colors: Record<Status, 'default'|'primary'|'secondary'|'success'|'error'|'warning'|'info'> = { DRAFT: 'default', SUBMITTED: 'info', UNDER_REVIEW: 'warning', CORRECTION_REQUESTED: 'secondary', SUBJECT_OFFICER_APPROVED: 'success', REJECTED: 'error', SSSB_PROCESSING: 'primary', COMPLETED: 'success' };
export function StatusChip({ status }: { status: Status }) { return <Chip size="small" color={colors[status]} label={status.replaceAll('_', ' ')} />; }

