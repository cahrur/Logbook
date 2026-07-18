import { overdueDays } from './schedule';

// A roadmap step is overdue when its target has passed and it is not done.
export function roadmapOverdue(step) {
  return overdueDays(step?.target_date, step?.status === 'done');
}
