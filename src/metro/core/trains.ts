import { planRide, positionAt, type RidePlan, type RidePosition } from './ride';
import { parseClock } from './time';
import type {
    DayType,
    Direction,
    LineData,
    NetworkData,
    ServicePattern,
} from './types';

/**
 * Every train on the network at a moment, from the timetables alone.
 *
 * The headway bands are runs of *equal* gaps between consecutive
 * departures (see scripts/metro/extract_timetable.py), so each band
 * `{from, to, minutes}` is exactly the departures from, from + minutes, …,
 * to. Unrolling them gives back the published departure list, and each
 * departure's ride plan says where that train is at any second.
 *
 * These are scheduled positions — where the timetable says trains should
 * be, not where they are.
 */

const seconds = (clock: string) => {
    const parsed = parseClock(clock);
    return parsed.ok ? parsed.value : Number.NaN;
};

const departureCache = new WeakMap<ServicePattern, number[]>();

/** Departure times (seconds of day) at the pattern's first station. */
export const patternDepartures = (pattern: ServicePattern): number[] => {
    const cached = departureCache.get(pattern);
    if (cached) return cached;

    const out = new Set<number>();
    for (const band of pattern.headways) {
        const from = seconds(band.from);
        const to = seconds(band.to);
        out.add(from);
        out.add(to);
        // A band with an unknown gap only tells us its two ends.
        if (band.minutes === null) continue;
        for (let t = from; t < to; t += band.minutes * 60) out.add(t);
    }
    const list = [...out].sort((a, b) => a - b);
    departureCache.set(pattern, list);
    return list;
};

export interface ScheduledTrain {
    /** Stable per trip within a day: line, direction, pattern, departure. */
    key: string;
    lineId: string;
    direction: Direction;
    /** Seconds of day it left its first station. */
    departedAt: number;
    plan: RidePlan;
    position: RidePosition;
}

/** No trip in the timetables is anywhere near this long. */
const MAX_TRIP_SECONDS = 3 * 3600;

const planCache = new WeakMap<LineData, Map<string, RidePlan | null>>();

const tripPlan = (
    line: LineData,
    pattern: ServicePattern,
    dayType: DayType,
    departure: number
): RidePlan | null => {
    let cache = planCache.get(line);
    if (!cache) {
        cache = new Map();
        planCache.set(line, cache);
    }
    const key = `${pattern.from}>${pattern.to}|${dayType}|${departure}`;
    if (!cache.has(key)) {
        const plan = planRide(line, pattern.from, pattern.to, {
            dayType,
            departAt: departure,
        });
        cache.set(key, plan.ok ? plan.value : null);
    }
    return cache.get(key) ?? null;
};

/** Trains between their first and last station at `secondsOfDay`. */
export const trainsAt = (
    network: NetworkData,
    dayType: DayType,
    secondsOfDay: number
): ScheduledTrain[] => {
    const trains: ScheduledTrain[] = [];
    for (const line of network.lines) {
        for (const direction of ['forward', 'backward'] as Direction[]) {
            const patterns = line.directions[direction].service[dayType];
            if (!patterns) continue;
            for (const pattern of patterns) {
                for (const departure of patternDepartures(pattern)) {
                    if (departure > secondsOfDay) break;
                    if (secondsOfDay - departure > MAX_TRIP_SECONDS) continue;
                    const plan = tripPlan(line, pattern, dayType, departure);
                    if (!plan) continue;
                    const elapsed = secondsOfDay - departure;
                    if (elapsed > plan.totalSeconds) continue;
                    trains.push({
                        key: `${line.id}|${direction}|${pattern.from}|${departure}`,
                        lineId: line.id,
                        direction,
                        departedAt: departure,
                        plan,
                        position: positionAt(plan, elapsed),
                    });
                }
            }
        }
    }
    return trains;
};

/** Where a train is, in words: at a station, or between two. */
export type TrainWhere =
    | { kind: 'at'; stationId: string }
    | { kind: 'between'; fromId: string; toId: string }
    /** Not left yet: waiting to depart from its first station. */
    | { kind: 'waiting'; stationId: string; departsAt: number };

export interface ApproachingTrain {
    key: string;
    lineId: string;
    direction: Direction;
    /** Seconds of day it leaves (or left) its first station. */
    departedAt: number;
    where: TrainWhere;
    /** Stations between it and the platform, not counting either end. */
    stopsAway: number;
    /** Seconds until it is at the platform (0 = there now). */
    etaSeconds: number;
    /** Present once the train has left its first station. */
    train: ScheduledTrain | null;
}

/**
 * The next trains that will call at `fromId` and then go on to `toId`, as
 * the timetable has them at `secondsOfDay`: where each one is now and how
 * long until it reaches the platform. Includes trains that haven't left
 * their first station yet, so the answer is right near the terminals too.
 */
export const approachingTrains = (
    network: NetworkData,
    lineId: string,
    fromId: string,
    toId: string,
    dayType: DayType,
    secondsOfDay: number,
    limit = 3
): ApproachingTrain[] => {
    const line = network.lines.find((l) => l.id === lineId);
    if (!line) return [];
    const indexOf = (id: string) => line.stations.findIndex((s) => s.id === id);
    const from = indexOf(fromId);
    const to = indexOf(toId);
    if (from < 0 || to < 0 || from === to) return [];
    const direction: Direction = to > from ? 'forward' : 'backward';

    const found: ApproachingTrain[] = [];
    for (const pattern of line.directions[direction].service[dayType] ?? []) {
        let fromThisPattern = 0;
        for (const departure of patternDepartures(pattern)) {
            if (secondsOfDay - departure > MAX_TRIP_SECONDS) continue;
            const plan = tripPlan(line, pattern, dayType, departure);
            if (!plan) continue;
            // Only trips that call at the platform and then the destination.
            const k = plan.stationIds.indexOf(fromId);
            if (k < 0 || !plan.stationIds.includes(toId)) continue;
            if (plan.stationIds.indexOf(toId) < k) continue;

            const arrival = departure + plan.cumulativeSeconds[k];
            if (arrival < secondsOfDay) continue; // already gone by
            // Departures are in order: once this pattern has given `limit`
            // trains still to come, later ones can't be among the first.
            if (fromThisPattern >= limit) break;

            const elapsed = secondsOfDay - departure;
            let where: TrainWhere;
            let stopsAway: number;
            let train: ScheduledTrain | null = null;
            if (elapsed < 0) {
                where = {
                    kind: 'waiting',
                    stationId: plan.stationIds[0],
                    departsAt: departure,
                };
                stopsAway = Math.max(k - 1, 0);
            } else {
                const position = positionAt(plan, elapsed);
                train = {
                    key: `${line.id}|${direction}|${pattern.from}|${departure}`,
                    lineId: line.id,
                    direction,
                    departedAt: departure,
                    plan,
                    position,
                };
                const atStation =
                    position.legFraction === 0 || position.progress >= 1;
                const here =
                    position.progress >= 1
                        ? plan.stationIds.length - 1
                        : position.leg;
                where = atStation
                    ? { kind: 'at', stationId: plan.stationIds[here] }
                    : {
                          kind: 'between',
                          fromId: plan.stationIds[position.leg],
                          toId: plan.stationIds[position.leg + 1],
                      };
                stopsAway = Math.max(
                    k - (atStation ? here : position.leg) - 1,
                    0
                );
            }
            fromThisPattern += 1;
            found.push({
                key: `${line.id}|${direction}|${pattern.from}|${departure}`,
                lineId: line.id,
                direction,
                departedAt: departure,
                where,
                stopsAway,
                etaSeconds: arrival - secondsOfDay,
                train,
            });
        }
    }
    return found.sort((a, b) => a.etaSeconds - b.etaSeconds).slice(0, limit);
};
