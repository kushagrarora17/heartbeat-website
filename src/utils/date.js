// Date utilities for recurring events and schema.org date/time generation
// Note: recurring event startDate is computed at build time; rebuild daily via Netlify for freshness

export const IST_OFFSET = "+05:30";
export const WEEKDAYS = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

export function nextWeekdayDate(targetWeekday, { includeToday = true, from = new Date() } = {}) {
  const day = from.getDay();
  let delta = (targetWeekday - day + 7) % 7;
  if (delta === 0 && !includeToday) delta = 7;
  const target = new Date(from);
  target.setDate(from.getDate() + delta);
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const dd = String(target.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parseRecurrence(dateField) {
  const match = dateField?.match(/Every\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
  if (!match) return null;
  const weekdayName = match[1].toLowerCase();
  const weekday = WEEKDAYS[weekdayName];
  return { weekday, label: match[1], byDay: `https://schema.org/${match[1]}` };
}

export function parseTimeOfDay(timeField) {
  if (!timeField) return null;
  const cleaned = timeField.replace(/\s*IST\s*$/, "").trim();
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return { hours: String(hours).padStart(2, "0"), minutes: String(minutes).padStart(2, "0") };
}

export function parseDurationToISO(duration) {
  if (!duration) return null;
  const hoursMatch = duration.match(/(\d+(?:\.\d+)?)\s*hours?/i);
  const minutesMatch = duration.match(/(\d+)\s*minutes?/i);

  if (hoursMatch) {
    const h = parseFloat(hoursMatch[1]);
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    let iso = `PT${hours}H`;
    if (mins > 0) iso += `${mins}M`;
    return iso;
  }
  if (minutesMatch) {
    const mins = parseInt(minutesMatch[1]);
    return `PT${mins}M`;
  }
  return null;
}

export function toIstIso(dateYmd, timeField) {
  if (!dateYmd) return null;
  const time = parseTimeOfDay(timeField);
  if (!time) return dateYmd; // return date-only if time unparseable
  return `${dateYmd}T${time.hours}:${time.minutes}:00${IST_OFFSET}`;
}

export function addIsoDuration(startIso, isoDuration) {
  if (!startIso || !isoDuration) return null;
  const start = new Date(startIso);
  if (isNaN(start.getTime())) return null;

  const durationMatch = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!durationMatch) return null;
  const hours = parseInt(durationMatch[1] || 0);
  const minutes = parseInt(durationMatch[2] || 0);
  start.setHours(start.getHours() + hours);
  start.setMinutes(start.getMinutes() + minutes);

  const yyyy = start.getFullYear();
  const mm = String(start.getMonth() + 1).padStart(2, "0");
  const dd = String(start.getDate()).padStart(2, "0");
  const h = String(start.getHours()).padStart(2, "0");
  const m = String(start.getMinutes()).padStart(2, "0");
  const s = String(start.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${h}:${m}:${s}${IST_OFFSET}`;
}
