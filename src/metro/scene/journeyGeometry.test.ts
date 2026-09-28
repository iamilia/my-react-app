import { describe, expect, it } from 'vitest';
import { planJourney } from '../core';
import { NETWORK } from '../data/lines';
import { routeStops, trainAt } from './journeyGeometry';
import { networkLayout } from './networkLayout';

const result = planJourney(NETWORK, 'tajrish', 'meydan-e-enghelab', {
    dayType: 'weekday',
    secondsOfDay: 8 * 3600,
});
if (!result.ok) throw new Error('fixture');
const journey = result.value;

describe('routeStops', () => {
    it('lists each station once with its role', () => {
        const stops = routeStops(journey);
        expect(stops[0]).toMatchObject({
            stationId: 'tajrish',
            role: 'origin',
        });
        expect(stops.at(-1)).toMatchObject({
            stationId: 'meydan-e-enghelab',
            role: 'destination',
        });
        expect(stops.filter((s) => s.role === 'transfer')).toEqual([
            { stationId: 'darvazeh-dowlat', role: 'transfer', lineId: '1' },
        ]);
        const ids = stops.map((s) => s.stationId);
        expect(new Set(ids).size).toBe(ids.length);
    });
});

describe('trainAt', () => {
    const layout = networkLayout(NETWORK);

    it('is at the interchange when the first ride ends', () => {
        const change = trainAt(layout, journey, 31 * 60);
        const dowlat = layout.stations.get('darvazeh-dowlat');
        expect(change.lineId).toBe('4');
        expect(change.point[0]).toBeCloseTo(dowlat?.[0] ?? Number.NaN);
        expect(change.point[2]).toBeCloseTo(dowlat?.[2] ?? Number.NaN);
    });
});
