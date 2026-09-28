import { describe, expect, it } from 'vitest';
import { interchanges, planRide, positionAt } from '../core';
import { NETWORK } from '../data/lines';
import { curvePoint, easeLeg, lineIndexToT, trainLineIndex } from './layout';
import { networkLayout } from './networkLayout';

const layout = networkLayout(NETWORK);
const line4 = NETWORK.lines.find((l) => l.id === '4');
if (!line4) throw new Error('fixture');

describe('network layout', () => {
    it('places every station of every line', () => {
        for (const line of NETWORK.lines) {
            expect(layout.lines.get(line.id)).toHaveLength(
                line.stations.length
            );
        }
    });

    it('puts an interchange at the same spot on every line', () => {
        for (const station of interchanges(NETWORK)) {
            const spots = station.lineIds.map((lineId) => {
                const line = NETWORK.lines.find((l) => l.id === lineId);
                const i = line?.stations.findIndex((s) => s.id === station.id);
                return layout.lines.get(lineId)?.[i ?? -1];
            });
            for (const p of spots) expect(p).toEqual(spots[0]);
        }
    });

    it('keeps stations apart', () => {
        const all = [...layout.stations.values()];
        let closest = Number.POSITIVE_INFINITY;
        for (let i = 0; i < all.length; i += 1) {
            for (let j = i + 1; j < all.length; j += 1) {
                closest = Math.min(
                    closest,
                    Math.hypot(all[i][0] - all[j][0], all[i][2] - all[j][2])
                );
            }
        }
        expect(closest).toBeGreaterThan(0.3);
    });

    it('puts Kolahdooz (east) to the right of Allameh Jafari (west)', () => {
        const east = layout.stations.get('shahid-kolahdooz');
        const west = layout.stations.get('allameh-jafari');
        expect(east?.[0]).toBeGreaterThan(west?.[0] ?? 0);
    });

    it('is deterministic', () => {
        const again = networkLayout({ ...NETWORK });
        expect(again.stations.get('tajrish')).toEqual(
            layout.stations.get('tajrish')
        );
    });
});

describe('schematic curve', () => {
    const points = layout.lines.get('4') ?? [];

    it('passes through every station', () => {
        points.forEach((p, i) => {
            const q = curvePoint(points, lineIndexToT(i, points.length));
            expect(q[0]).toBeCloseTo(p[0]);
            expect(q[2]).toBeCloseTo(p[2]);
        });
    });
});

describe('train placement follows the ride plan', () => {
    const plan = planRide(line4, 'shahid-kolahdooz', 'meydan-e-enghelab');
    if (!plan.ok) throw new Error('fixture');

    it('easing never moves the train off a station at its scheduled time', () => {
        expect(easeLeg(0)).toBe(0);
        expect(easeLeg(1)).toBe(1);
        plan.value.cumulativeSeconds.forEach((t, k) => {
            const index = trainLineIndex(plan.value, positionAt(plan.value, t));
            expect(index).toBeCloseTo(plan.value.stationIndices[k]);
        });
    });

    it('reaches the destination exactly at the ride time', () => {
        const end = positionAt(plan.value, plan.value.totalSeconds);
        expect(trainLineIndex(plan.value, end)).toBe(10);
        const before = positionAt(plan.value, plan.value.totalSeconds - 1);
        expect(trainLineIndex(plan.value, before)).toBeLessThan(10);
    });
});
