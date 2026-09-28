/**
 * Where things go on the network diagram for a given journey — shared by
 * the 3D scene and the SVG fallback so both show the same thing.
 */

import { type Journey, journeyPositionAt, type ScheduledTrain } from '../core';
import {
    curvePoint,
    curveTangent,
    lineIndexToT,
    trainLineIndex,
    type Vec3,
} from './layout';
import type { NetworkLayout } from './networkLayout';

export type StopRole = 'origin' | 'destination' | 'transfer' | 'stop';

export interface RouteStop {
    stationId: string;
    role: StopRole;
    /** Line of the leg this stop belongs to (the arriving leg at a transfer). */
    lineId: string;
}

/** Every station the journey passes, each once, with its role. */
export const routeStops = (journey: Journey): RouteStop[] => {
    const stops: RouteStop[] = [];
    journey.legs.forEach((leg, i) => {
        const ids = leg.plan.stationIds;
        ids.forEach((stationId, k) => {
            if (i > 0 && k === 0) return; // already added as the transfer
            const isFirst = i === 0 && k === 0;
            const isLast =
                i === journey.legs.length - 1 && k === ids.length - 1;
            const isTransfer = !isLast && k === ids.length - 1;
            stops.push({
                stationId,
                lineId: leg.lineId,
                role: isFirst
                    ? 'origin'
                    : isLast
                      ? 'destination'
                      : isTransfer
                        ? 'transfer'
                        : 'stop',
            });
        });
    });
    return stops;
};

/** The stretch of each line the journey rides, as station indices. */
export const routeSpans = (journey: Journey) =>
    journey.legs.map((leg) => {
        const idx = leg.plan.stationIndices;
        const a = idx[0];
        const b = idx[idx.length - 1];
        return { lineId: leg.lineId, lo: Math.min(a, b), hi: Math.max(a, b) };
    });

/** Train position and heading `seconds` of ride time into the journey. */
export const trainAt = (
    layout: NetworkLayout,
    journey: Journey,
    seconds: number
) => {
    const at = journeyPositionAt(journey, seconds);
    const leg = journey.legs[at.legIndex];
    const points = layout.lines.get(leg.lineId) ?? [];
    const t = lineIndexToT(
        trainLineIndex(leg.plan, at.position),
        points.length
    );
    const sign = leg.plan.direction === 'forward' ? 1 : -1;
    const d = curveTangent(points, t);
    return {
        lineId: leg.lineId,
        legIndex: at.legIndex,
        point: curvePoint(points, t),
        heading: [d[0] * sign, d[1] * sign, d[2] * sign] as Vec3,
    };
};

/** Bounds of the journey's route on the diagram. */
export const journeyBounds = (layout: NetworkLayout, journey: Journey) => {
    const xs: number[] = [];
    const zs: number[] = [];
    for (const span of routeSpans(journey)) {
        const points = layout.lines.get(span.lineId) ?? [];
        const samples = Math.max(1, (span.hi - span.lo) * 6);
        for (let k = 0; k <= samples; k += 1) {
            const index = span.lo + ((span.hi - span.lo) * k) / samples;
            const p = curvePoint(points, lineIndexToT(index, points.length));
            xs.push(p[0]);
            zs.push(p[2]);
        }
    }
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    return {
        center: [(minX + maxX) / 2, 0, (minZ + maxZ) / 2] as Vec3,
        width: maxX - minX,
        depth: maxZ - minZ,
    };
};

/**
 * Where a scheduled train is drawn. Trains in the two directions share one
 * drawn line, so each is nudged to its own side of it (to the right of
 * its heading — a drawing choice, not track data) to keep both visible.
 */
export const scheduledTrainPoint = (
    layout: NetworkLayout,
    train: ScheduledTrain,
    sideOffset = 0.2
) => {
    const points = layout.lines.get(train.lineId) ?? [];
    const t = lineIndexToT(
        trainLineIndex(train.plan, train.position),
        points.length
    );
    const sign = train.direction === 'forward' ? 1 : -1;
    const d = curveTangent(points, t);
    const heading: Vec3 = [d[0] * sign, d[1] * sign, d[2] * sign];
    const [x, y, z] = curvePoint(points, t);
    // Right of the heading on screen (x east, z south, north up).
    const point: Vec3 = [
        x - heading[2] * sideOffset,
        y,
        z + heading[0] * sideOffset,
    ];
    return { point, heading };
};
