// Builds an iCalendar file with the weekly stream schedule, so a visitor can
// add every stream to their own calendar in one tap. Calendar apps convert
// the Madrid time to the visitor's time zone on their own.

const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

// Madrid rules (CET/CEST), so apps that ignore IANA names still get it right.
const VTIMEZONE = {
  'Europe/Madrid': [
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Madrid',
    'BEGIN:DAYLIGHT',
    'DTSTART:19700329T020000',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'TZNAME:CEST',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'DTSTART:19701025T030000',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'TZNAME:CET',
    'END:STANDARD',
    'END:VTIMEZONE',
  ],
};

const escape = (text) => text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/**
 * @param {{ days: number[], time: string, timezone: string, durationMinutes: number }} schedule
 * @param {{ name: string, url: string, platforms: string[] }} info
 */
export function scheduleCalendar(schedule, { name, url, platforms }) {
  // 2026-01-04 is a Sunday: day N of the week falls on 2026-01-(4+N).
  const firstDay = Math.min(...schedule.days);
  const date = `202601${String(4 + firstDay).padStart(2, '0')}`;
  const time = schedule.time.replace(':', '') + '00';
  const days = [...schedule.days].sort().map((d) => BYDAY[d]).join(',');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${name}//Directos//ES`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Directos de ${escape(name)}`,
    ...(VTIMEZONE[schedule.timezone] ?? []),
    'BEGIN:VEVENT',
    `UID:directos-${name.toLowerCase()}@landing`,
    'DTSTAMP:20260101T000000Z',
    `DTSTART;TZID=${schedule.timezone}:${date}T${time}`,
    `DURATION:PT${schedule.durationMinutes}M`,
    `RRULE:FREQ=WEEKLY;BYDAY=${days}`,
    `SUMMARY:${escape(`Directo de ${name}`)}`,
    `DESCRIPTION:${escape(`En directo en ${platforms.join(', ')}.\n${url}`)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}
