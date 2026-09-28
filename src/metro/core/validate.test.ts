import { describe, expect, it } from 'vitest';
import line4Json from '../data/line-4.json';
import { formatClock, parseClock, tehranClock } from './time';
import { parseLineData } from './validate';

describe('parseLineData', () => {
    it('accepts the generated Line 4 file', () => {
        const result = parseLineData(line4Json);
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.stations).toHaveLength(20);
        expect(result.value.directions.forward.segmentSeconds).toHaveLength(19);
    });

    it('rejects a segment list of the wrong length', () => {
        const broken = structuredClone(line4Json) as Record<string, unknown>;
        const directions = broken.directions as {
            forward: { segmentSeconds: number[] };
        };
        directions.forward.segmentSeconds = [60];
        const result = parseLineData(broken);
        expect(!result.ok && result.error.path).toBe(
            '$.directions.forward.segmentSeconds'
        );
    });

    it('rejects a malformed clock time', () => {
        const broken = structuredClone(line4Json);
        const service = broken.directions.forward.service.weekday;
        service[0].firstDeparture = '5.30';
        const result = parseLineData(broken);
        expect(!result.ok && result.error.code).toBe('INVALID_LINE_DATA');
    });

    it('accepts null timings as explicit "missing"', () => {
        const withHole = structuredClone(line4Json) as unknown as {
            directions: { forward: { segmentSeconds: (number | null)[] } };
        };
        withHole.directions.forward.segmentSeconds[3] = null;
        expect(parseLineData(withHole).ok).toBe(true);
    });
});

describe('time helpers', () => {
    it('parses and formats HH:MM', () => {
        expect(parseClock('05:30')).toEqual({ ok: true, value: 19_800 });
        expect(parseClock('24:00').ok).toBe(false);
        expect(parseClock('7').ok).toBe(false);
        expect(formatClock(19_800)).toBe('05:30');
        expect(formatClock(86_400 + 60)).toBe('00:01');
    });

    it('reads day type and time in Tehran (UTC+3:30)', () => {
        // Friday 25 Sep 2026, 12:00 in Tehran.
        expect(tehranClock(new Date('2026-09-25T08:30:00Z'))).toEqual({
            dayType: 'holiday',
            secondsOfDay: 12 * 3600,
        });
        // Thursday 24 Sep 2026, 23:30 in Tehran.
        expect(tehranClock(new Date('2026-09-24T20:00:00Z')).dayType).toBe(
            'thursday'
        );
        // 00:30 Friday in Tehran is still Thursday in UTC.
        expect(tehranClock(new Date('2026-09-24T21:00:00Z')).dayType).toBe(
            'holiday'
        );
        // Monday → ordinary weekday.
        expect(tehranClock(new Date('2026-09-28T05:00:00Z')).dayType).toBe(
            'weekday'
        );
    });
});
