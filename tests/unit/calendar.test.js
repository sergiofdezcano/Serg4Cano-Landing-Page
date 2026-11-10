import { describe, expect, it } from 'vitest';
import { scheduleCalendar } from '../../src/lib/calendar.js';

const schedule = { days: [5, 1, 3], time: '20:00', timezone: 'Europe/Madrid', durationMinutes: 180 };
const info = { name: 'Serg4Cano', url: 'https://www.twitch.tv/serg4cano', platforms: ['Twitch', 'Kick'] };

describe('scheduleCalendar', () => {
  const ics = scheduleCalendar(schedule, info);

  it('repeats every week on the stream days, at Madrid time', () => {
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR\r\n');
    // 2026-01-05 is a Monday, the first stream day of the week
    expect(ics).toContain('DTSTART;TZID=Europe/Madrid:20260105T200000\r\n');
    expect(ics).toContain('DURATION:PT180M\r\n');
    expect(ics).toContain('TZID:Europe/Madrid\r\n');
  });

  it('is a single well-formed calendar with CRLF line endings', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/\n/);
  });

  it('escapes commas in text fields', () => {
    expect(ics).toContain('DESCRIPTION:En directo en Twitch\\, Kick.\\nhttps://www.twitch.tv/serg4cano\r\n');
  });
});
