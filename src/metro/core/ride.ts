import { parseClock } from './time';
import {
    type DayType,
    type Direction,
    err,
    type LineData,
    type MetroError,
    ok,
    type Result,
    type SegmentPeriod,
} from './types';

/**
 * One ride on one line, laid out on a timeline. This is the single source of
 * truth for everything time-related on the page: the minutes in the result
 * card are `totalSeconds`, and the animated train's position is
 * `positionAt(plan, t)` for `t` in `[0, totalSeconds]`.
 */
export interface RidePlan {
    lineId: string;
    direction: Direction;
    /** Day type whose segment times were used (`null` = the default set). */
    dayType: DayType | null;
    /** Time-of-day segment period that applied, if any. */
    period: SegmentPeriod | null;
    /** Indices into `line.stations`, in travel order (origin first). */
    stationIndices: number[];
    /** Station ids in travel order (origin first). */
    stationIds: string[];
    /**
     * Seconds after leaving the origin at which the train is at each station
     * of `stationIds`. Starts at 0, ends at `totalSeconds`.
     */
    cumulativeSeconds: number[];
    totalSeconds: number;
}

export interface RideOptions {
    /** Picks day-type-specific segment times when the line has them. */
    dayType?: DayType;
    /**
     * Seconds since midnight at which the rider leaves the origin. With
     * `dayType`, picks time-of-day segment periods when the line has them.
     */
    departAt?: number;
}

export const stationIndex = (
    line: LineData,
    stationId: string
): Result<number> => {
    const index = line.stations.findIndex((s) => s.id === stationId);
    return index === -1
        ? err({ code: 'UNKNOWN_STATION', stationId, lineId: line.id })
        : ok(index);
};

const clockSeconds = (value: string) => {
    const parsed = parseClock(value);
    return parsed.ok ? parsed.value : Number.NaN;
};

/** Segment times for one direction, with any day-type override applied. */
export const segmentsFor = (
    line: LineData,
    direction: Direction,
    dayType?: DayType
): (number | null)[] => {
    const data = line.directions[direction];
    return (
        (dayType && data.segmentSecondsByDayType?.[dayType]) ||
        data.segmentSeconds
    );
};

/** The time-of-day period for a train leaving the terminal at `seconds`. */
export const periodFor = (
    line: LineData,
    direction: Direction,
    dayType: DayType,
    terminalSeconds: number
): SegmentPeriod | null =>
    line.directions[direction].segmentPeriods?.find(
        (p) =>
            p.dayType === dayType &&
            clockSeconds(p.from) <= terminalSeconds &&
            terminalSeconds <= clockSeconds(p.to)
    ) ?? null;

type Walk =
    | { ok: true; indices: number[]; cumulative: number[] }
    | { ok: false; missing: [number, number] };

/** Walks the segments from index `from` to `to`, accumulating seconds. */
const walk = (
    segments: (number | null)[],
    from: number,
    to: number,
    dwell: number
): Walk => {
    const step = to > from ? 1 : -1;
    const indices = [from];
    const cumulative = [0];
    let elapsed = 0;
    for (let i = from; i !== to; i += step) {
        const next = i + step;
        // Segment k always joins stations[k] and stations[k + 1].
        const seconds = segments[Math.min(i, next)];
        if (seconds === null || seconds === undefined) {
            return { ok: false, missing: [i, next] };
        }
        // Dwell is added at every intermediate stop, i.e. before every
        // segment except the first.
        elapsed += seconds + (i === from ? 0 : dwell);
        indices.push(next);
        cumulative.push(elapsed);
    }
    return { ok: true, indices, cumulative };
};

export const planRide = (
    line: LineData,
    fromId: string,
    toId: string,
    options: RideOptions = {}
): Result<RidePlan> => {
    const from = stationIndex(line, fromId);
    if (!from.ok) return from;
    const to = stationIndex(line, toId);
    if (!to.ok) return to;
    if (from.value === to.value) {
        return err({ code: 'SAME_STATION', stationId: fromId });
    }

    if (!line.segmentsIncludeDwell && line.dwellSeconds === null) {
        return err({ code: 'MISSING_DWELL_TIME', lineId: line.id });
    }
    const dwell = line.segmentsIncludeDwell ? 0 : (line.dwellSeconds ?? 0);

    const direction: Direction = to.value > from.value ? 'forward' : 'backward';
    const { dayType, departAt } = options;
    let segments = segmentsFor(line, direction, dayType);

    // Periods are keyed by departure at the terminal, so work out when this
    // train left it. (The approach uses the day's normal times; a period
    // only changes what happens from there on.)
    let period: SegmentPeriod | null = null;
    if (dayType && departAt !== undefined) {
        const terminal = direction === 'forward' ? 0 : line.stations.length - 1;
        const approach =
            terminal === from.value
                ? { ok: true as const, cumulative: [0] }
                : walk(segments, terminal, from.value, dwell);
        if (approach.ok) {
            const offset = approach.cumulative[approach.cumulative.length - 1];
            period = periodFor(line, direction, dayType, departAt - offset);
            if (period) segments = period.segmentSeconds;
        }
    }

    const result = walk(segments, from.value, to.value, dwell);
    if (!result.ok) {
        return err({
            code: 'MISSING_SEGMENT_TIME',
            lineId: line.id,
            direction,
            between: [
                line.stations[result.missing[0]].id,
                line.stations[result.missing[1]].id,
            ],
        });
    }

    return ok({
        lineId: line.id,
        direction,
        dayType:
            dayType &&
            line.directions[direction].segmentSecondsByDayType?.[dayType]
                ? dayType
                : null,
        period,
        stationIndices: result.indices,
        stationIds: result.indices.map((index) => line.stations[index].id),
        cumulativeSeconds: result.cumulative,
        totalSeconds: result.cumulative[result.cumulative.length - 1],
    });
};

/** Ride time in seconds between two stations on one line, either direction. */
export const rideSeconds = (
    line: LineData,
    fromId: string,
    toId: string,
    options: RideOptions = {}
): Result<number> => {
    const plan = planRide(line, fromId, toId, options);
    return plan.ok ? ok(plan.value.totalSeconds) : plan;
};

export interface RidePosition {
    /** Seconds since departure, clamped to `[0, totalSeconds]`. */
    elapsedSeconds: number;
    /** 0 at the origin, 1 at the destination. */
    progress: number;
    /** Index into `plan.stationIds` of the station just left. */
    leg: number;
    /** 0–1 within the current leg. */
    legFraction: number;
    /**
     * Fractional index into `line.stations` — e.g. 3.5 is halfway between
     * stations 3 and 4. Scenes map this straight onto their curve.
     */
    lineIndex: number;
}

/** Where the train is `elapsedSeconds` after leaving the origin. */
export const positionAt = (
    plan: RidePlan,
    elapsedSeconds: number
): RidePosition => {
    const { cumulativeSeconds: cum, stationIndices, totalSeconds } = plan;
    const t = Math.min(Math.max(elapsedSeconds, 0), totalSeconds);

    let leg = 0;
    while (leg < cum.length - 2 && t >= cum[leg + 1]) leg += 1;

    const span = cum[leg + 1] - cum[leg];
    const legFraction = span > 0 ? (t - cum[leg]) / span : 1;
    const step = plan.direction === 'forward' ? 1 : -1;

    return {
        elapsedSeconds: t,
        progress: totalSeconds > 0 ? t / totalSeconds : 1,
        leg,
        legFraction,
        lineIndex: stationIndices[leg] + step * legFraction,
    };
};

/** Seconds from a station to another on the same line (0 when equal). */
export const secondsBetween = (
    line: LineData,
    fromId: string,
    toId: string,
    dayType?: DayType
): Result<number, MetroError> =>
    fromId === toId ? ok(0) : rideSeconds(line, fromId, toId, { dayType });

/** Seconds from a direction's origin terminal to a station. */
export const secondsFromTerminal = (
    line: LineData,
    direction: Direction,
    stationId: string,
    dayType?: DayType
): Result<number, MetroError> => {
    const terminal =
        direction === 'forward'
            ? line.stations[0]
            : line.stations[line.stations.length - 1];
    return secondsBetween(line, terminal.id, stationId, dayType);
};
