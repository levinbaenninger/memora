import {
  addDays,
  endOfDay,
  format,
  isSameDay,
  isTomorrow,
  isYesterday,
  startOfDay,
} from "date-fns";

export type DueBucket = "overdue" | "today" | "upcoming" | "no-date";

/**
 * A due date carries a time only if it isn't local midnight. Date-only tasks
 * are stored at 00:00 local; anything else means the user picked a time.
 */
export function dueHasTime(dueAt: Date): boolean {
  return (
    dueAt.getHours() !== 0 ||
    dueAt.getMinutes() !== 0 ||
    dueAt.getSeconds() !== 0
  );
}

/**
 * Classify an (active) task by its due date. A timed task is overdue the moment
 * its time passes; a date-only task is overdue once its day has ended.
 */
export function bucketOf(
  dueAt: Date | null,
  now: Date = new Date()
): DueBucket {
  if (!dueAt) {
    return "no-date";
  }
  if (isSameDay(dueAt, now)) {
    if (dueHasTime(dueAt) && dueAt.getTime() < now.getTime()) {
      return "overdue";
    }
    return "today";
  }
  return dueAt.getTime() < now.getTime() ? "overdue" : "upcoming";
}

/** Human-friendly due label, e.g. "Today, 3:00 PM", "Tomorrow", "May 31". */
export function formatDue(dueAt: Date, now: Date = new Date()): string {
  const timed = dueHasTime(dueAt);
  const time = timed ? format(dueAt, "p") : "";

  let day: string;
  if (isSameDay(dueAt, now)) {
    day = "Today";
  } else if (isTomorrow(dueAt)) {
    day = "Tomorrow";
  } else if (isYesterday(dueAt)) {
    day = "Yesterday";
  } else if (dueAt.getFullYear() === now.getFullYear()) {
    day = format(dueAt, "MMM d");
  } else {
    day = format(dueAt, "MMM d, yyyy");
  }

  return timed ? `${day}, ${time}` : day;
}

/** Inclusive end-of-today, used to query "due today or overdue". */
export function endOfToday(now: Date = new Date()): Date {
  return endOfDay(now);
}

/** Start of the day N days from now. */
export function startOfDayFromNow(days: number, now: Date = new Date()): Date {
  return startOfDay(addDays(now, days));
}
