import { profile, social } from '../lib/data.js';
import { scheduleCalendar } from '../lib/calendar.js';

// Static file at build time: /directos.ics
export function GET() {
  const platforms = profile.streamPlatforms.map((id) => social(id)?.label).filter(Boolean);
  const body = scheduleCalendar(profile.schedule, {
    name: profile.name,
    url: social(profile.streamPlatforms[0])?.url ?? social('youtube').url,
    platforms,
  });
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}
