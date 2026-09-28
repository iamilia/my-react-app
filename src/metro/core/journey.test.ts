import { describe, expect, it } from 'vitest';
import { NETWORK } from '../data/lines';
import transfersJson from '../data/transfers.json';
import {
    interchanges,
    journeyPositionAt,
    networkStations,
    planJourney,
    planJourneys,
} from './journey';
import type { NetworkData } from './types';

const at = (hh: number, mm: number) => hh * 3600 + mm * 60;
const weekday8 = { dayType: 'weekday' as const, secondsOfDay: at(8, 0) };

describe('network data', () => {
    it('loads all seven lines', () => {
        expect(NETWORK.lines.map((l) => l.id)).toEqual([
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
        ]);
    });

    it('joins lines at shared station ids', () => {
        const ids = interchanges(NETWORK).map((s) => s.id);
        expect(ids).toContain('darvazeh-dowlat');
        expect(ids).toContain('tarbiat-modares'); // spelled differently on 6 and 7
        expect(ids).toContain('haft-e-tir'); // هفت تیر / هفتم تیر
        expect(ids).toContain('sadeghieh'); // تهران (صادقیه) / صادقیه
    });

    it('lists every interchange in transfers.json, and nothing else', () => {
        const listed = transfersJson.transfers.map((t) => t.stationId).sort();
        const actual = interchanges(NETWORK)
            .map((s) => s.id)
            .sort();
        expect(listed).toEqual(actual);
    });

    it('has one entry per station', () => {
        const stations = networkStations(NETWORK);
        expect(new Set(stations.map((s) => s.id)).size).toBe(stations.length);
    });
});

describe('planJourney', () => {
    it('Kolahdooz → Enghelab is a single Line 4 ride', () => {
        const result = planJourney(
            NETWORK,
            'shahid-kolahdooz',
            'meydan-e-enghelab',
            weekday8
        );
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.legs).toHaveLength(1);
        expect(result.value.transfers).toHaveLength(0);
        expect(result.value.rideSeconds).toBe(24 * 60);
        expect(result.value.waitSeconds).toBe(150);
        expect(result.value.totalSeconds).toBe(24 * 60 + 150);
    });

    it('Tajrish → Enghelab changes from Line 1 to Line 4 at Darvazeh Dowlat', () => {
        const result = planJourney(
            NETWORK,
            'tajrish',
            'meydan-e-enghelab',
            weekday8
        );
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const { legs, transfers } = result.value;
        expect(legs.map((l) => l.lineId)).toEqual(['1', '4']);
        expect(transfers[0]).toMatchObject({
            stationId: 'darvazeh-dowlat',
            fromLineId: '1',
            toLineId: '4',
            walkSeconds: null,
        });
        // Line 1 Tajrish → Darvazeh Dowlat 31 min + Line 4 → Enghelab 8 min.
        expect(result.value.rideSeconds).toBe(39 * 60);
    });

    it('has no total while a transfer walking time is unknown', () => {
        const result = planJourney(
            NETWORK,
            'tajrish',
            'meydan-e-enghelab',
            weekday8
        );
        expect(result.ok && result.value.walkSeconds).toBeNull();
        expect(result.ok && result.value.totalSeconds).toBeNull();
        expect(result.ok && result.value.knownSeconds).toBeGreaterThan(39 * 60);
    });

    it('includes the walking time once it is known', () => {
        const network: NetworkData = {
            ...NETWORK,
            transfers: NETWORK.transfers.map((t) => ({
                ...t,
                walkSeconds: 120,
            })),
        };
        const result = planJourney(
            network,
            'tajrish',
            'meydan-e-enghelab',
            weekday8
        );
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const { rideSeconds, waitSeconds, walkSeconds, totalSeconds } =
            result.value;
        expect(walkSeconds).toBe(120 * result.value.transfers.length);
        expect(totalSeconds).toBe(
            rideSeconds + (waitSeconds ?? Number.NaN) + (walkSeconds ?? 0)
        );
    });

    it('still finds a route when nothing is running, without waits', () => {
        const result = planJourney(NETWORK, 'tajrish', 'meydan-e-enghelab', {
            dayType: 'weekday',
            secondsOfDay: at(3, 0),
        });
        expect(result.ok && result.value.rideSeconds).toBe(39 * 60);
        expect(result.ok && result.value.waitSeconds).toBeNull();
    });

    it('validates its input', () => {
        expect(
            planJourney(NETWORK, 'nowhere', 'tajrish', weekday8)
        ).toMatchObject({ ok: false, error: { code: 'UNKNOWN_STATION' } });
        expect(
            planJourney(NETWORK, 'tajrish', 'tajrish', weekday8)
        ).toMatchObject({ ok: false, error: { code: 'SAME_STATION' } });
    });
});

describe('journeyPositionAt', () => {
    const result = planJourney(
        NETWORK,
        'tajrish',
        'meydan-e-enghelab',
        weekday8
    );
    if (!result.ok) throw new Error('fixture');
    const journey = result.value;

    it('plays the legs back to back over the ride time', () => {
        expect(journeyPositionAt(journey, 0).legIndex).toBe(0);
        const change = journeyPositionAt(journey, 31 * 60);
        expect(change.legIndex).toBe(1);
        expect(change.position.lineIndex).toBe(7); // Darvazeh Dowlat on Line 4
        const end = journeyPositionAt(journey, journey.rideSeconds);
        expect(end.progress).toBe(1);
        expect(end.position.lineIndex).toBe(10); // Enghelab
    });
});

describe('planJourneys — alternatives', () => {
    it('keeps a faster route with more transfers as an alternative', () => {
        const result = planJourneys(
            NETWORK,
            'tajrish',
            'meydan-e-enghelab',
            weekday8
        );
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const [best, ...others] = result.value;
        expect(best.transfers).toHaveLength(1);
        // Via Shahid Beheshti (Line 3) and Teatr-e Shahr: less known time,
        // but two walks nobody has measured yet.
        expect(others[0].legs.map((l) => l.lineId)).toEqual(['1', '3', '4']);
        expect(others[0].knownSeconds).toBeLessThan(best.knownSeconds);
    });

    it('picks the fastest once walking times are known', () => {
        const network: NetworkData = {
            ...NETWORK,
            transfers: NETWORK.transfers.map((t) => ({
                ...t,
                walkSeconds: 60,
            })),
        };
        const result = planJourneys(
            network,
            'tajrish',
            'meydan-e-enghelab',
            weekday8
        );
        if (!result.ok) throw new Error('route');
        const costs = result.value.map((j) => j.totalSeconds ?? Infinity);
        expect(costs[0]).toBe(Math.min(...costs));
    });
});
