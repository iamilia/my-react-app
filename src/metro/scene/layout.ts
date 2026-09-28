/**
 * Schematic geometry shared by the 3D scene and the SVG fallback, so both draw
 * the same curve and put the train at the same place for the same second.
 *
 * Pure TypeScript on purpose: the fallback must not pull `three` into its
 * chunk, so the curve maths lives here and the 3D scene wraps it in a
 * `THREE.Curve` rather than the other way round.
 *
 * Station positions come from ./networkLayout.ts.
 */

import type { RidePlan, RidePosition } from '../core';

export type Vec3 = [number, number, number];

const catmull = (p0: number, p1: number, p2: number, p3: number, t: number) => {
    const v0 = (p2 - p0) * 0.5;
    const v1 = (p3 - p1) * 0.5;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
        (2 * p1 - 2 * p2 + v0 + v1) * t3 +
        (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 +
        v0 * t +
        p1
    );
};

/**
 * Uniform Catmull-Rom through `points`, `t ∈ [0, 1]`. Passes exactly through
 * `points[i]` at `t = i / (points.length - 1)`, which is what lets a
 * fractional station index map straight onto the curve.
 */
export const curvePoint = (points: Vec3[], t: number): Vec3 => {
    const last = points.length - 1;
    const scaled = Math.min(Math.max(t, 0), 1) * last;
    const i = Math.min(Math.floor(scaled), last - 1);
    const local = scaled - i;

    const p1 = points[i];
    const p2 = points[i + 1];
    // Mirror the neighbours at the ends so the curve doesn't overshoot.
    const p0 = points[i - 1] ?? [
        2 * p1[0] - p2[0],
        2 * p1[1] - p2[1],
        2 * p1[2] - p2[2],
    ];
    const p3 = points[i + 2] ?? [
        2 * p2[0] - p1[0],
        2 * p2[1] - p1[1],
        2 * p2[2] - p1[2],
    ];

    return [
        catmull(p0[0], p1[0], p2[0], p3[0], local),
        catmull(p0[1], p1[1], p2[1], p3[1], local),
        catmull(p0[2], p1[2], p2[2], p3[2], local),
    ];
};

/** Unit tangent by central difference. */
export const curveTangent = (points: Vec3[], t: number): Vec3 => {
    const h = 1e-3;
    const a = curvePoint(points, Math.max(t - h, 0));
    const b = curvePoint(points, Math.min(t + h, 1));
    const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]) || 1;
    return [d[0] / len, d[1] / len, d[2] / len];
};

export const lineIndexToT = (lineIndex: number, stationCount: number) =>
    lineIndex / (stationCount - 1);

/**
 * Accelerate out of a station, brake into the next. Only the shape inside a
 * leg changes — at every station boundary this is exactly 0 or 1, so the
 * train is still at station k at `cumulativeSeconds[k]`.
 */
export const easeLeg = (fraction: number) =>
    fraction * fraction * (3 - 2 * fraction);

/** Fractional station index to draw the train at. */
export const trainLineIndex = (plan: RidePlan, position: RidePosition) => {
    const step = plan.direction === 'forward' ? 1 : -1;
    return (
        plan.stationIndices[position.leg] + step * easeLeg(position.legFraction)
    );
};
