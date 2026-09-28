import { describe, expect, it } from 'vitest';
import line4Json from '../data/line-4.json';
import { planRide, positionAt, rideSeconds, secondsFromTerminal } from './ride';
import type { LineData } from './types';
import { parseLineData } from './validate';

const parsed = parseLineData(line4Json);
if (!parsed.ok) throw new Error(JSON.stringify(parsed.error));
const line4: LineData = parsed.value;

const KOLAHDOOZ = 'shahid-kolahdooz';
const ENGHELAB = 'meydan-e-enghelab';
const ALLAMEH = 'allameh-jafari';
const ERAM = 'eram-e-sabz';

/** A three-station line whose middle segment is unknown in one direction. */
const tinyLine = (overrides: Partial<LineData> = {}): LineData => ({
    id: 'T',
    name: { fa: 'آزمایشی', en: 'Test' },
    color: '#000',
    source: { file: 'fixture', sheets: [], extractedOn: '2026-01-01' },
    segmentsIncludeDwell: true,
    dwellSeconds: null,
    stations: [
        { id: 'a', fa: 'الف', en: 'A' },
        { id: 'b', fa: 'ب', en: 'B' },
        { id: 'c', fa: 'پ', en: 'C' },
    ],
    directions: {
        forward: {
            towards: 'c',
            segmentSeconds: [60, 120],
            segmentSecondsByDayType: { holiday: [90, 150] },
            service: { weekday: null, thursday: null, holiday: null },
        },
        backward: {
            towards: 'a',
            segmentSeconds: [60, null],
            service: { weekday: null, thursday: null, holiday: null },
        },
    },
    ...overrides,
});

describe('rideSeconds — Line 4 (from the Mehr 1404 timetable)', () => {
    it('Kolahdooz → Enghelab is 24 minutes', () => {
        // First weekday train: dep. Kolahdooz 05:30, at Enghelab 05:54.
        expect(rideSeconds(line4, KOLAHDOOZ, ENGHELAB)).toEqual({
            ok: true,
            value: 24 * 60,
        });
    });

    it('Enghelab → Kolahdooz (reverse) is also 24 minutes', () => {
        expect(rideSeconds(line4, ENGHELAB, KOLAHDOOZ)).toEqual({
            ok: true,
            value: 24 * 60,
        });
    });

    it('uses per-direction segment times where they differ', () => {
        // Eram-e Sabz → Allameh Jafari is 4 min; the other way it is 3 min.
        expect(rideSeconds(line4, ERAM, ALLAMEH)).toEqual({
            ok: true,
            value: 240,
        });
        expect(rideSeconds(line4, ALLAMEH, ERAM)).toEqual({
            ok: true,
            value: 180,
        });
    });

    it('matches the end-to-end run times printed in the sheets', () => {
        // Kolahdooz 05:30 → Allameh 06:16; Allameh 05:30 → Kolahdooz 06:15.
        expect(rideSeconds(line4, KOLAHDOOZ, ALLAMEH)).toEqual({
            ok: true,
            value: 46 * 60,
        });
        expect(rideSeconds(line4, ALLAMEH, KOLAHDOOZ)).toEqual({
            ok: true,
            value: 45 * 60,
        });
    });
});

describe('planRide', () => {
    it('lists stations in travel order with cumulative times', () => {
        const plan = planRide(line4, KOLAHDOOZ, ENGHELAB);
        expect(plan.ok).toBe(true);
        if (!plan.ok) return;

        expect(plan.value.direction).toBe('forward');
        expect(plan.value.stationIds[0]).toBe(KOLAHDOOZ);
        expect(plan.value.stationIds.at(-1)).toBe(ENGHELAB);
        expect(plan.value.stationIds).toHaveLength(11);
        expect(plan.value.cumulativeSeconds).toEqual([
            0, 120, 240, 360, 480, 600, 780, 960, 1080, 1260, 1440,
        ]);
    });

    it('goes backward when the destination comes first', () => {
        const plan = planRide(line4, ENGHELAB, KOLAHDOOZ);
        expect(plan.ok && plan.value.direction).toBe('backward');
        expect(plan.ok && plan.value.stationIndices).toEqual([
            10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
        ]);
    });

    it('applies day-type segment overrides', () => {
        const line = tinyLine();
        expect(rideSeconds(line, 'a', 'c')).toEqual({ ok: true, value: 180 });
        expect(rideSeconds(line, 'a', 'c', { dayType: 'holiday' })).toEqual({
            ok: true,
            value: 240,
        });
        const plan = planRide(line, 'a', 'c', { dayType: 'holiday' });
        expect(plan.ok && plan.value.dayType).toBe('holiday');
    });

    it('adds dwell at intermediate stops when segments exclude it', () => {
        const line = tinyLine({
            segmentsIncludeDwell: false,
            dwellSeconds: 30,
        });
        // 60 + (30 dwell at b) + 120
        expect(rideSeconds(line, 'a', 'c')).toEqual({ ok: true, value: 210 });
    });
});

describe('input validation', () => {
    it('rejects an unknown origin', () => {
        expect(rideSeconds(line4, 'nowhere', ENGHELAB)).toEqual({
            ok: false,
            error: {
                code: 'UNKNOWN_STATION',
                stationId: 'nowhere',
                lineId: '4',
            },
        });
    });

    it('rejects an unknown destination', () => {
        const result = rideSeconds(line4, KOLAHDOOZ, 'tajrish');
        expect(!result.ok && result.error.code).toBe('UNKNOWN_STATION');
    });

    it('rejects the same origin and destination', () => {
        expect(rideSeconds(line4, ENGHELAB, ENGHELAB)).toEqual({
            ok: false,
            error: { code: 'SAME_STATION', stationId: ENGHELAB },
        });
    });

    it('reports a missing segment instead of guessing', () => {
        expect(rideSeconds(tinyLine(), 'c', 'a')).toEqual({
            ok: false,
            error: {
                code: 'MISSING_SEGMENT_TIME',
                lineId: 'T',
                direction: 'backward',
                between: ['c', 'b'],
            },
        });
        // The known half still works.
        expect(rideSeconds(tinyLine(), 'b', 'a')).toEqual({
            ok: true,
            value: 60,
        });
    });

    it('reports a missing dwell time when segments exclude dwell', () => {
        const line = tinyLine({ segmentsIncludeDwell: false });
        expect(rideSeconds(line, 'a', 'c')).toEqual({
            ok: false,
            error: { code: 'MISSING_DWELL_TIME', lineId: 'T' },
        });
    });
});

describe('positionAt — the animation reads the same plan', () => {
    const plan = planRide(line4, KOLAHDOOZ, ENGHELAB);
    if (!plan.ok) throw new Error('plan failed');

    it('starts at the origin and ends at the destination', () => {
        expect(positionAt(plan.value, 0).lineIndex).toBe(0);
        expect(positionAt(plan.value, 1440).lineIndex).toBe(10);
        expect(positionAt(plan.value, 1440).progress).toBe(1);
    });

    it('is at each station exactly at its cumulative time', () => {
        plan.value.cumulativeSeconds.forEach((t, k) => {
            expect(positionAt(plan.value, t).lineIndex).toBeCloseTo(
                plan.value.stationIndices[k]
            );
        });
    });

    it('interpolates within a segment and clamps outside the ride', () => {
        expect(positionAt(plan.value, 60).lineIndex).toBeCloseTo(0.5);
        expect(positionAt(plan.value, -10).lineIndex).toBe(0);
        expect(positionAt(plan.value, 99_999).lineIndex).toBe(10);
    });

    it('moves towards lower indices on a backward ride', () => {
        const back = planRide(line4, ENGHELAB, KOLAHDOOZ);
        if (!back.ok) throw new Error('plan failed');
        // Enghelab → Teatr-e Shahr takes 3 minutes.
        expect(positionAt(back.value, 90).lineIndex).toBeCloseTo(9.5);
        expect(positionAt(back.value, 180).lineIndex).toBeCloseTo(9);
    });
});

describe('secondsFromTerminal', () => {
    it('is 0 at the terminal itself', () => {
        expect(secondsFromTerminal(line4, 'forward', KOLAHDOOZ)).toEqual({
            ok: true,
            value: 0,
        });
    });

    it('measures from the far terminal for backward trains', () => {
        // Allameh Jafari → Enghelab: 21 minutes.
        expect(secondsFromTerminal(line4, 'backward', ENGHELAB)).toEqual({
            ok: true,
            value: 21 * 60,
        });
    });
});
