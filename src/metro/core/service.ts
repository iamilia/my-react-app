import { planRide, type RidePlan, secondsBetween, stationIndex } from './ride';
import { parseClock } from './time';
import {
    type DayType,
    type Direction,
    err,
    type HeadwayBand,
    type LineData,
    type MetroError,
    ok,
    type Result,
    type ServicePattern,
} from './types';

export interface HeadwayInfo {
    /** Combined headway of every service pattern that makes this ride. */
    headwaySeconds: number;
    /** The band each contributing pattern is in at that moment. */
    bands: { pattern: ServicePattern; band: HeadwayBand }[];
}

/** Parses a clock value that the validator already checked. */
const seconds = (clock: string): number => {
    const parsed = parseClock(clock);
    if (!parsed.ok) throw new Error(`unvalidated clock value "${clock}"`);
    return parsed.value;
};

/** Bands are half-open [from, to); the last one also owns its closing time. */
const bandAt = (bands: HeadwayBand[], t: number) =>
    bands.find(
        (b, i) =>
            seconds(b.from) <= t &&
            (t < seconds(b.to) ||
                (i === bands.length - 1 && t === seconds(b.to)))
    );

/**
 * Scheduled headway for a ride from `fromId` to `toId` starting at
 * `secondsOfDay`.
 *
 * Only trips that cover the whole ride count (a Tajrish → Shahr-e Rey short
 * trip is no use to someone going to Kahrizak). Bands are published at each
 * pattern's first station, so the rider's time is shifted back by the ride
 * time from there. When several patterns serve the ride, their frequencies
 * add up (1/h = Σ 1/hᵢ) — this assumes they are evenly interleaved.
 */
export const headwayAt = (
    line: LineData,
    direction: Direction,
    fromId: string,
    toId: string,
    dayType: DayType,
    secondsOfDay: number
): Result<HeadwayInfo> => {
    const patterns = line.directions[direction].service[dayType];
    const noData = err<MetroError>({
        code: 'NO_SERVICE_DATA',
        lineId: line.id,
        direction,
        dayType,
    });
    if (!patterns) return noData;

    const from = stationIndex(line, fromId);
    if (!from.ok) return from;
    const to = stationIndex(line, toId);
    if (!to.ok) return to;

    const index = (id: string) => line.stations.findIndex((s) => s.id === id);
    const covers = (p: ServicePattern) => {
        const a = index(p.from);
        const b = index(p.to);
        return direction === 'forward'
            ? a <= from.value && to.value <= b
            : a >= from.value && to.value >= b;
    };

    const usable = patterns.filter(covers);
    if (usable.length === 0) return noData;

    let frequency = 0;
    let firstAtStation = Number.POSITIVE_INFINITY;
    let lastAtStation = Number.NEGATIVE_INFINITY;
    const contributing: HeadwayInfo['bands'] = [];

    for (const pattern of usable) {
        const offset = secondsBetween(line, pattern.from, fromId, dayType);
        if (!offset.ok) return offset;

        const first = seconds(pattern.firstDeparture);
        const last = seconds(pattern.lastDeparture);
        firstAtStation = Math.min(firstAtStation, first + offset.value);
        lastAtStation = Math.max(lastAtStation, last + offset.value);

        const atStart = secondsOfDay - offset.value;
        if (atStart < first || atStart > last) continue;

        const band = bandAt(pattern.headways, atStart);
        if (!band || band.minutes === null) {
            return err({
                code: 'MISSING_HEADWAY',
                lineId: line.id,
                direction,
                dayType,
                band: band ?? null,
            });
        }
        frequency += 1 / (band.minutes * 60);
        contributing.push({ pattern, band });
    }

    if (frequency === 0) {
        return err({
            code: 'OUT_OF_SERVICE',
            lineId: line.id,
            direction,
            dayType,
            firstAtStation,
            lastAtStation,
        });
    }

    return ok({ headwaySeconds: 1 / frequency, bands: contributing });
};

/**
 * Expected wait for someone who turns up at a random moment: half the
 * headway. (Real waits are longer when trains bunch; this is the schedule's
 * best case.)
 */
export const averageWaitSeconds = (headwaySeconds: number): number =>
    headwaySeconds / 2;

/** Door-to-door on the platform: wait + ride. */
export const totalTripSeconds = (
    waitSeconds: number,
    rideSeconds: number
): number => waitSeconds + rideSeconds;

export type WaitResult = Result<HeadwayInfo & { waitSeconds: number }>;

export const waitAt = (
    line: LineData,
    direction: Direction,
    fromId: string,
    toId: string,
    dayType: DayType,
    secondsOfDay: number
): WaitResult => {
    const headway = headwayAt(
        line,
        direction,
        fromId,
        toId,
        dayType,
        secondsOfDay
    );
    return headway.ok
        ? ok({
              ...headway.value,
              waitSeconds: averageWaitSeconds(headway.value.headwaySeconds),
          })
        : headway;
};

export interface TripEstimate {
    plan: RidePlan;
    rideSeconds: number;
    /** Wait can fail (out of service, missing band) while the ride is fine. */
    wait: WaitResult;
    /** `null` whenever `wait` failed. */
    totalSeconds: number | null;
}

/** Single-line estimate: wait at the origin, then the ride. */
export const estimateTrip = (
    line: LineData,
    fromId: string,
    toId: string,
    when: { dayType: DayType; secondsOfDay: number }
): Result<TripEstimate, MetroError> => {
    const probe = planRide(line, fromId, toId, { dayType: when.dayType });
    if (!probe.ok) return probe;

    const wait = waitAt(
        line,
        probe.value.direction,
        fromId,
        toId,
        when.dayType,
        when.secondsOfDay
    );
    const plan = planRide(line, fromId, toId, {
        dayType: when.dayType,
        departAt: when.secondsOfDay + (wait.ok ? wait.value.waitSeconds : 0),
    });
    if (!plan.ok) return plan;

    const ride = plan.value.totalSeconds;
    return ok({
        plan: plan.value,
        rideSeconds: ride,
        wait,
        totalSeconds: wait.ok
            ? totalTripSeconds(wait.value.waitSeconds, ride)
            : null,
    });
};
