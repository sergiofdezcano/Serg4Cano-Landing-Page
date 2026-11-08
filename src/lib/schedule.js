// Works out the next stream slot from the weekly schedule, in the
// streamer's own time zone, whatever the visitor's time zone is.

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function wallClock(date, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return {
    day: WEEKDAYS[parts.weekday],
    seconds: Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second),
  };
}

/**
 * @returns {{ live: boolean, secondsUntil: number, secondsLeft?: number }}
 *   live: we are inside a scheduled slot right now.
 */
export function nextSlot(schedule, now = new Date()) {
  const [h, m] = schedule.time.split(':').map(Number);
  const start = h * 3600 + m * 60;
  const duration = schedule.durationMinutes * 60;
  const { day, seconds } = wallClock(now, schedule.timezone);
  const WEEK = 7 * 86400;
  let best = Infinity;

  for (const slotDay of schedule.days) {
    const delta = ((slotDay - day + 7) % 7) * 86400 + (start - seconds);
    const lastStart = delta > 0 ? delta - WEEK : delta; // <= 0
    const nextStart = delta > 0 ? delta : delta + WEEK; // > 0
    if (lastStart > -duration) return { live: true, secondsUntil: 0, secondsLeft: duration + lastStart };
    best = Math.min(best, nextStart);
  }
  return { live: false, secondsUntil: best };
}

export function splitDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}
