import { describe, expect, it } from 'vitest';
import { NETWORK } from '../data/lines';
import { approachingTrains, patternDepartures, trainsAt } from './trains';

const at = (hh: number, mm: number) => hh * 3600 + mm * 60;
const line = (id: string) => {
    const found = NETWORK.lines.find((l) => l.id === id);
    if (!found) throw new Error(id);
    return found;
};

describe('patternDepartures — unrolling the headway bands', () => {
    const ketab = line('7').directions.forward.service.weekday?.[0];
    if (!ketab) throw new Error('fixture');
    const deps = patternDepartures(ketab);

    it('gives back every departure in the sheet', () => {
        // Line 7, Meydan-e Ketab → Takhti, Sat–Wed: 82 trips in the sheet.
        expect(deps).toHaveLength(82);
        expect(deps[0]).toBe(at(5, 30));
        expect(deps.at(-1)).toBe(at(23, 0));
    });

    it('is every 13 minutes through the day', () => {
        const midday = deps.filter((t) => t >= at(7, 0) && t <= at(22, 0));
        const gaps = midday.slice(1).map((t, i) => t - midday[i]);
        expect(new Set(gaps)).toEqual(new Set([13 * 60]));
    });
});

describe('trainsAt', () => {
    it('puts the first Line 4 train at Enghelab at 05:54', () => {
        // Sheet: dep. Kolahdooz 05:30, at Enghelab 05:54.
        const trains = trainsAt(NETWORK, 'weekday', at(5, 54)).filter(
            (t) => t.lineId === '4' && t.direction === 'forward'
        );
        const first = trains.find((t) => t.departedAt === at(5, 30));
        expect(first?.position.lineIndex).toBe(10);
    });

    it('has nothing running in the small hours', () => {
        expect(trainsAt(NETWORK, 'weekday', at(3, 0))).toHaveLength(0);
    });

    it('spaces trains on a line by the headway', () => {
        // Line 7 towards Takhti at 12:00: a train every 13 minutes, so the
        // number in service is the trip time / 13, rounded up or down.
        const trains = trainsAt(NETWORK, 'weekday', at(12, 0)).filter(
            (t) => t.lineId === '7' && t.direction === 'forward'
        );
        const trip = trains[0].plan.totalSeconds;
        expect(trains.length).toBeGreaterThanOrEqual(Math.floor(trip / 780));
        expect(trains.length).toBeLessThanOrEqual(Math.ceil(trip / 780));
    });

    it('covers every line at midday', () => {
        const lines = new Set(
            trainsAt(NETWORK, 'weekday', at(12, 0)).map((t) => t.lineId)
        );
        expect([...lines].sort()).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    });
});

describe('approachingTrains', () => {
    it('the first Line 4 train is 24 min from Enghelab when it leaves Kolahdooz', () => {
        const [next] = approachingTrains(
            NETWORK,
            '4',
            'meydan-e-enghelab',
            'allameh-jafari',
            'weekday',
            at(5, 30)
        );
        expect(next.where).toEqual({
            kind: 'at',
            stationId: 'shahid-kolahdooz',
        });
        expect(next.etaSeconds).toBe(24 * 60);
        // Niroo Havaei … Teatr-e Shahr: 9 stations in between.
        expect(next.stopsAway).toBe(9);
    });

    it('describes a train between two stations', () => {
        // 05:31: the 05:30 train is halfway to Niroo Havaei (2 min segment).
        const [next] = approachingTrains(
            NETWORK,
            '4',
            'meydan-e-enghelab',
            'allameh-jafari',
            'weekday',
            at(5, 31)
        );
        expect(next.where).toEqual({
            kind: 'between',
            fromId: 'shahid-kolahdooz',
            toId: 'niroo-havaei',
        });
        expect(next.etaSeconds).toBe(23 * 60);
    });

    it('includes trains that have not left the terminal yet', () => {
        const trains = approachingTrains(
            NETWORK,
            '4',
            'niroo-havaei',
            'meydan-e-enghelab',
            'weekday',
            at(5, 20)
        );
        expect(trains[0].where).toEqual({
            kind: 'waiting',
            stationId: 'shahid-kolahdooz',
            departsAt: at(5, 30),
        });
        expect(trains[0].etaSeconds).toBe(12 * 60);
        expect(trains).toHaveLength(3);
    });

    it('lists trains in arrival order, spaced by the headway', () => {
        const trains = approachingTrains(
            NETWORK,
            '7',
            'towhid',
            'mahdieh',
            'weekday',
            at(12, 0)
        );
        const gaps = trains
            .slice(1)
            .map((t, i) => t.etaSeconds - trains[i].etaSeconds);
        expect(gaps).toEqual([13 * 60, 13 * 60]);
    });

    it('skips Line 1 short trips for a ride past Shahr-e Rey', () => {
        const trains = approachingTrains(
            NETWORK,
            '1',
            'tajrish',
            'kahrizak',
            'weekday',
            at(8, 0),
            5
        );
        for (const t of trains) {
            expect(t.train?.plan.stationIds.at(-1) ?? 'kahrizak').toBe(
                'kahrizak'
            );
        }
    });
});
