import { parseDateLocal, todayISO } from './format';

const DAY_MS = 86400000;

// Derives task state from an activity. An activity is a task when it has a due_date.
export function taskState(activity) {
  const due = activity?.due_date ? parseDateLocal(activity.due_date) : null;
  if (!due) return { isTask: false };

  const done = !!activity.completed_at;
  const completed = done ? parseDateLocal(activity.completed_at) : null;
  const today = parseDateLocal(todayISO());

  // Days completed past the deadline (overtime).
  const overtimeDays = done && completed ? Math.max(0, Math.round((completed - due) / DAY_MS)) : 0;
  // Days a still-open task is past its deadline.
  const overdueDays = !done ? Math.max(0, Math.round((today - due) / DAY_MS)) : 0;

  let tone = 'info';
  let label = 'Tugas';
  if (done) {
    tone = overtimeDays > 0 ? 'warn' : 'good';
    label = overtimeDays > 0 ? `Selesai · telat ${overtimeDays}h` : 'Selesai';
  } else if (overdueDays > 0) {
    tone = 'bad';
    label = `Telat ${overdueDays}h`;
  } else {
    tone = 'info';
    label = 'Belum selesai';
  }

  return { isTask: true, done, due, completed, overtimeDays, overdueDays, tone, label };
}
