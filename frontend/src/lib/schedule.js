import { parseDateLocal, todayISO } from './format';

const TODAY = parseDateLocal(todayISO());

// Days a target date is past due, given whether the item is already done.
// Returns 0 when there's no target, it's done, or the target hasn't passed.
export function overdueDays(targetDate, done) {
  if (!targetDate || done) return 0;
  const due = parseDateLocal(targetDate);
  if (!due || due >= TODAY) return 0;
  return Math.round((TODAY - due) / 86400000);
}
