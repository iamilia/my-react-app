import { type DayType, err, ok, type Result } from './types';

const CLOCK = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/** "05:30" → 19800 (seconds since midnight). */
export const parseClock = (
    value: string
): Result<number, { code: 'INVALID_TIME'; value: string }> => {
    const match = CLOCK.exec(value.trim());
    if (!match) return err({ code: 'INVALID_TIME', value });
    return ok(Number(match[1]) * 3600 + Number(match[2]) * 60);
};

/** Seconds since midnight → "HH:MM" (wraps past midnight). */
export const formatClock = (secondsOfDay: number): string => {
    const total = Math.floor(secondsOfDay / 60);
    const minutes = ((total % 1440) + 1440) % 1440;
    const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mm = String(minutes % 60).padStart(2, '0');
    return `${hh}:${mm}`;
};

export const TEHRAN_TZ = 'Asia/Tehran';

/**
 * Iranian week: Saturday–Wednesday are ordinary days, Thursday has its own
 * sheet, Friday runs the holiday timetable. Public holidays that fall on
 * other days can't be known from the date alone — the UI lets the visitor
 * pick "holiday" by hand.
 */
const WEEKDAY_TO_DAY_TYPE: Record<string, DayType> = {
    Sat: 'weekday',
    Sun: 'weekday',
    Mon: 'weekday',
    Tue: 'weekday',
    Wed: 'weekday',
    Thu: 'thursday',
    Fri: 'holiday',
};

let tehranFormatter: Intl.DateTimeFormat | null = null;

/** Day type and time of day in Tehran for a given instant. */
export const tehranClock = (
    instant: Date
): { dayType: DayType; secondsOfDay: number } => {
    tehranFormatter ??= new Intl.DateTimeFormat('en-US', {
        timeZone: TEHRAN_TZ,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    });

    const parts: Record<string, string> = {};
    for (const part of tehranFormatter.formatToParts(instant)) {
        parts[part.type] = part.value;
    }

    return {
        dayType: WEEKDAY_TO_DAY_TYPE[parts.weekday] ?? 'weekday',
        secondsOfDay:
            Number(parts.hour) * 3600 +
            Number(parts.minute) * 60 +
            Number(parts.second),
    };
};
