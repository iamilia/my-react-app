import { describe, expect, it } from 'vitest';
import line1Json from '../data/line-1.json';
import line4Json from '../data/line-4.json';
import line5Json from '../data/line-5.json';
import { rideSeconds } from './ride';
import {
    averageWaitSeconds,
    estimateTrip,
    headwayAt,
    totalTripSeconds,
} from './service';
import type { LineData } from './types';
import { parseLineData } from './validate';

const load = (json: unknown): LineData => {
    const parsed = parseLineData(json);
    if (!parsed.ok) throw new Error(JSON.stringify(parsed.error));
    return parsed.value;
};
const line1 = load(line1Json);
const line4 = load(line4Json);
const line5 = load(line5Json);

const at = (hh: number, mm: number) => hh * 3600 + mm * 60;
const KOLAHDOOZ = 'shahid-kolahdooz';
const ENGHELAB = 'meydan-e-enghelab';
const ALLAMEH = 'allameh-jafari';

describe('headwayAt — Line 4', () => {
    it('finds the band at the origin terminal', () => {
        const result = headwayAt(
            line4,
            'forward',
            KOLAHDOOZ,
            ENGHELAB,
            'weekday',
            at(8, 0)
        );
        expect(result.ok && result.value.headwaySeconds).toBe(300);
        expect(result.ok && result.value.bands[0].band).toEqual({
            from: '05:30',
            to: '09:00',
            minutes: 5,
        });
    });

    it('shifts mid-line stations back to the pattern start', () => {
        // Enghelab towards Kolahdooz at 08:00 = Allameh at 07:39 → 5 min band.
        const result = headwayAt(
            line4,
            'backward',
            ENGHELAB,
            KOLAHDOOZ,
            'weekday',
            at(8, 0)
        );
        expect(result.ok && result.value.bands[0].band).toEqual({
            from: '06:20',
            to: '09:50',
            minutes: 5,
        });
    });

    it('treats bands as half-open, with the last one closed', () => {
        const h = (t: number) =>
            headwayAt(line4, 'forward', KOLAHDOOZ, ENGHELAB, 'weekday', t);
        const nine = h(at(9, 0));
        expect(nine.ok && nine.value.headwaySeconds).toBe(360);
        const last = h(at(22, 0));
        expect(last.ok && last.value.headwaySeconds).toBe(600);
    });

    it('uses the day type', () => {
        const friday = headwayAt(
            line4,
            'forward',
            KOLAHDOOZ,
            ENGHELAB,
            'holiday',
            at(6, 10)
        );
        expect(friday.ok && friday.value.headwaySeconds).toBe(600);
    });

    it('reports out-of-service times with first/last train at the station', () => {
        const late = headwayAt(
            line4,
            'forward',
            ENGHELAB,
            ALLAMEH,
            'weekday',
            at(23, 0)
        );
        expect(late).toEqual({
            ok: false,
            error: {
                code: 'OUT_OF_SERVICE',
                lineId: '4',
                direction: 'forward',
                dayType: 'weekday',
                firstAtStation: at(5, 54),
                lastAtStation: at(22, 24),
            },
        });
    });

    it('reports a missing band instead of inventing one', () => {
        const line: LineData = structuredClone(line4);
        const service = line.directions.forward.service.weekday;
        if (!service) throw new Error('fixture');
        service[0].headways[0].minutes = null;
        const result = headwayAt(
            line,
            'forward',
            KOLAHDOOZ,
            ENGHELAB,
            'weekday',
            at(6, 0)
        );
        expect(!result.ok && result.error.code).toBe('MISSING_HEADWAY');
    });

    it('reports a day type with no sheet', () => {
        const line: LineData = structuredClone(line4);
        line.directions.forward.service.thursday = null;
        const result = headwayAt(
            line,
            'forward',
            KOLAHDOOZ,
            ENGHELAB,
            'thursday',
            at(8, 0)
        );
        expect(!result.ok && result.error.code).toBe('NO_SERVICE_DATA');
    });
});

describe('headwayAt — Line 1 short trips', () => {
    // Weekday 08:00 at Tajrish: Kahrizak trains every 10 min and Shahr-e
    // Rey trains every 10 min, both from the timetable.
    it('adds up the patterns that cover the ride', () => {
        const toSaadi = headwayAt(
            line1,
            'forward',
            'tajrish',
            'saadi',
            'weekday',
            at(8, 0)
        );
        expect(toSaadi.ok && toSaadi.value.bands).toHaveLength(2);
        expect(toSaadi.ok && toSaadi.value.headwaySeconds).toBe(300);
    });

    it('ignores short trips that stop before the destination', () => {
        const toKahrizak = headwayAt(
            line1,
            'forward',
            'tajrish',
            'kahrizak',
            'weekday',
            at(8, 0)
        );
        expect(toKahrizak.ok && toKahrizak.value.bands).toHaveLength(1);
        expect(toKahrizak.ok && toKahrizak.value.headwaySeconds).toBe(600);
    });
});

describe('segment periods — Line 5 all-stops trains held for expresses', () => {
    it('uses the period times for trains inside it', () => {
        // Sheet: dep. Golshahr 07:10, Sadeghieh 08:11 (4 min held at Garmdareh).
        expect(
            rideSeconds(line5, 'golshahr', 'sadeghieh', {
                dayType: 'weekday',
                departAt: at(7, 10),
            })
        ).toEqual({ ok: true, value: 61 * 60 });
    });

    it('uses the normal times outside it', () => {
        expect(
            rideSeconds(line5, 'golshahr', 'sadeghieh', {
                dayType: 'weekday',
                departAt: at(10, 0),
            })
        ).toEqual({ ok: true, value: 57 * 60 });
    });

    it('does not apply on other day types', () => {
        // Thursday has its own times (Garmdareh → Vardavard 7 min).
        expect(
            rideSeconds(line5, 'golshahr', 'sadeghieh', {
                dayType: 'thursday',
                departAt: at(7, 10),
            })
        ).toEqual({ ok: true, value: 57 * 60 });
    });
});

describe('wait and total', () => {
    it('average wait is half the headway', () => {
        expect(averageWaitSeconds(300)).toBe(150);
    });

    it('total = wait + ride', () => {
        expect(totalTripSeconds(150, 1440)).toBe(1590);
    });

    it('estimateTrip: Kolahdooz → Enghelab, weekday 08:00', () => {
        const result = estimateTrip(line4, KOLAHDOOZ, ENGHELAB, {
            dayType: 'weekday',
            secondsOfDay: at(8, 0),
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.rideSeconds).toBe(1440);
        expect(
            result.value.wait.ok && result.value.wait.value.waitSeconds
        ).toBe(150);
        expect(result.value.totalSeconds).toBe(1590);
    });

    it('estimateTrip keeps the ride when the wait is unknown', () => {
        const result = estimateTrip(line4, KOLAHDOOZ, ENGHELAB, {
            dayType: 'weekday',
            secondsOfDay: at(23, 30),
        });
        expect(result.ok && result.value.rideSeconds).toBe(1440);
        expect(result.ok && result.value.totalSeconds).toBeNull();
        expect(result.ok && !result.value.wait.ok).toBe(true);
    });

    it('estimateTrip passes input errors through', () => {
        const result = estimateTrip(line4, ENGHELAB, ENGHELAB, {
            dayType: 'weekday',
            secondsOfDay: at(8, 0),
        });
        expect(!result.ok && result.error.code).toBe('SAME_STATION');
    });
});
