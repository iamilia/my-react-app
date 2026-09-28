import { planRide, positionAt, type RidePlan, type RidePosition } from './ride';
import { type WaitResult, waitAt } from './service';
import {
    type DayType,
    type Direction,
    err,
    type LineData,
    type NetworkData,
    ok,
    type Result,
    type Station,
} from './types';

/**
 * Journeys across the network: one or more rides joined by transfers at
 * interchange stations.
 *
 * What the timetables give us — ride times and headways — is used as is.
 * Transfer walking times are not in them; each is `null` in
 * data/transfers.json until measured. Routing treats an unknown walk as 0
 * (so it never favours a route because of a number nobody has), and the
 * journey then reports no total, only what is known.
 */

export interface JourneyLeg {
    lineId: string;
    plan: RidePlan;
    /**
     * When the rider reaches this leg's platform, in seconds since midnight.
     * Unknown walking times are not included, so after such a transfer this
     * is a lower bound.
     */
    platformAt: number;
    wait: WaitResult;
}

export interface JourneyTransfer {
    stationId: string;
    fromLineId: string;
    toLineId: string;
    walkSeconds: number | null;
}

export interface Journey {
    fromId: string;
    toId: string;
    legs: JourneyLeg[];
    /** `transfers[i]` joins `legs[i]` and `legs[i + 1]`. */
    transfers: JourneyTransfer[];
    /** Always known: the sum of the legs' ride times. */
    rideSeconds: number;
    /** `null` if any leg's wait is unknown. */
    waitSeconds: number | null;
    /** `null` if any transfer's walking time is unknown. */
    walkSeconds: number | null;
    /** Wait + ride + walk, or `null` if any part is unknown. */
    totalSeconds: number | null;
    /** Everything that is known: ride + known waits + known walks. */
    knownSeconds: number;
}

export interface JourneyOptions {
    dayType: DayType;
    /** Arrival at the first platform; `null` = no time given (no waits). */
    secondsOfDay: number | null;
}

export interface NetworkStation extends Station {
    /** Lines serving the station, in network order. */
    lineIds: string[];
}

/** Every station once, with the lines that serve it. */
export const networkStations = (network: NetworkData): NetworkStation[] => {
    const byId = new Map<string, NetworkStation>();
    for (const line of network.lines) {
        for (const station of line.stations) {
            const known = byId.get(station.id);
            if (known) known.lineIds.push(line.id);
            else byId.set(station.id, { ...station, lineIds: [line.id] });
        }
    }
    return [...byId.values()];
};

/** Stations served by two or more lines. */
export const interchanges = (network: NetworkData) =>
    networkStations(network).filter((s) => s.lineIds.length > 1);

/** Longest chain of transfers the planner considers. */
const MAX_TRANSFERS = 3;

interface Label {
    /** Known seconds so far: rides + waits + known walks. */
    cost: number;
    /** Transfers whose walking time is unknown. */
    unknownWalks: number;
    /** Seconds of day, known parts only. */
    time: number;
    prev: string | null;
    leg: JourneyLeg | null;
    transfer: JourneyTransfer | null;
}

/**
 * Best-known journey for every number of transfers (0…MAX_TRANSFERS). State
 * = station + line arrived on + transfers so far, so a slower route with
 * fewer transfers survives next to a faster one with more.
 */
const search = (
    network: NetworkData,
    fromId: string,
    toId: string,
    options: JourneyOptions,
    useWaits: boolean
): Label[][] => {
    const linesAt = new Map<string, LineData[]>();
    for (const line of network.lines) {
        for (const s of line.stations) {
            linesAt.set(s.id, [...(linesAt.get(s.id) ?? []), line]);
        }
    }
    const walks = new Map(
        network.transfers.map((t) => [t.stationId, t.walkSeconds])
    );

    const labels = new Map<string, Label>();
    const done = new Set<string>();
    labels.set(`${fromId}||0`, {
        cost: 0,
        unknownWalks: 0,
        time: options.secondsOfDay ?? 0,
        prev: null,
        leg: null,
        transfer: null,
    });
    const found: Label[][] = [];

    const relax = (key: string, label: Label) => {
        const known = labels.get(key);
        if (!done.has(key) && (!known || label.cost < known.cost - 1e-9)) {
            labels.set(key, label);
        }
    };

    for (;;) {
        let key: string | null = null;
        let current: Label | null = null;
        for (const [k, label] of labels) {
            if (done.has(k)) continue;
            if (!current || label.cost < current.cost) {
                key = k;
                current = label;
            }
        }
        if (!key || !current) break;
        done.add(key);

        const [stationId, arrivedOn, k] = key.split('|');
        const transfersSoFar = Number(k);
        if (stationId === toId) {
            const path: Label[] = [];
            let at: string | null = key;
            while (at) {
                const label = labels.get(at);
                if (!label) break;
                path.unshift(label);
                at = label.prev;
            }
            found[transfersSoFar] ??= path;
            continue;
        }

        const isTransfer = arrivedOn !== '';
        if (isTransfer && transfersSoFar >= MAX_TRANSFERS) continue;
        const walk = isTransfer ? (walks.get(stationId) ?? null) : 0;
        const platformAt = current.time + (walk ?? 0);
        const nextK = transfersSoFar + (isTransfer ? 1 : 0);

        for (const line of linesAt.get(stationId) ?? []) {
            if (line.id === arrivedOn) continue;
            const from = line.stations.findIndex((s) => s.id === stationId);

            for (const direction of ['forward', 'backward'] as Direction[]) {
                const step = direction === 'forward' ? 1 : -1;
                for (
                    let j = from + step;
                    j >= 0 && j < line.stations.length;
                    j += step
                ) {
                    const target = line.stations[j].id;
                    const wait: WaitResult =
                        options.secondsOfDay === null
                            ? err({ code: 'INVALID_TIME', value: '' })
                            : waitAt(
                                  line,
                                  direction,
                                  stationId,
                                  target,
                                  options.dayType,
                                  platformAt
                              );
                    if (
                        useWaits &&
                        !wait.ok &&
                        wait.error.code === 'OUT_OF_SERVICE'
                    ) {
                        continue;
                    }
                    const waitSeconds =
                        useWaits && wait.ok ? wait.value.waitSeconds : 0;

                    const plan = planRide(line, stationId, target, {
                        dayType: options.dayType,
                        departAt:
                            options.secondsOfDay === null
                                ? undefined
                                : platformAt + waitSeconds,
                    });
                    // A gap in the data blocks everything beyond it.
                    if (!plan.ok) break;

                    const ride = plan.value.totalSeconds;
                    relax(`${target}|${line.id}|${nextK}`, {
                        cost: current.cost + (walk ?? 0) + waitSeconds + ride,
                        unknownWalks:
                            current.unknownWalks +
                            (isTransfer && walk === null ? 1 : 0),
                        time: platformAt + waitSeconds + ride,
                        prev: key,
                        leg: {
                            lineId: line.id,
                            plan: plan.value,
                            platformAt,
                            wait,
                        },
                        transfer: isTransfer
                            ? {
                                  stationId,
                                  fromLineId: arrivedOn,
                                  toLineId: line.id,
                                  walkSeconds: walk,
                              }
                            : null,
                    });
                }
            }
        }
    }
    return found;
};

const toJourney = (fromId: string, toId: string, path: Label[]): Journey => {
    const legs: JourneyLeg[] = [];
    const transfers: JourneyTransfer[] = [];
    for (const label of path) {
        if (label.transfer) transfers.push(label.transfer);
        if (label.leg) legs.push(label.leg);
    }

    const rideSeconds = legs.reduce((s, l) => s + l.plan.totalSeconds, 0);
    const waits = legs.map((l) =>
        l.wait.ok ? l.wait.value.waitSeconds : null
    );
    const walks = transfers.map((t) => t.walkSeconds);
    const sum = (xs: (number | null)[]) =>
        xs.reduce<number>((s, x) => s + (x ?? 0), 0);
    const waitSeconds = waits.every((w) => w !== null) ? sum(waits) : null;
    const walkSeconds = walks.every((w) => w !== null) ? sum(walks) : null;

    return {
        fromId,
        toId,
        legs,
        transfers,
        rideSeconds,
        waitSeconds,
        walkSeconds,
        totalSeconds:
            waitSeconds === null || walkSeconds === null
                ? null
                : rideSeconds + waitSeconds + walkSeconds,
        knownSeconds: rideSeconds + sum(waits) + sum(walks),
    };
};

/**
 * Candidate journeys, best first: at most one per number of transfers.
 *
 * Ordering: fewest transfers with an *unknown* walking time first, then
 * least known time, then fewest transfers. Comparing a 35-minute route with
 * two unmeasured walks against a 39-minute one with a single unmeasured
 * walk would mean guessing what the walks cost — so the planner doesn't;
 * it prefers the route with fewer unknowns. Once transfers.json has real
 * walking times, this is simply the fastest route.
 *
 * If nothing runs at the requested time, routes are chosen by ride time
 * alone and each leg's wait says why it's unknown.
 */
export const planJourneys = (
    network: NetworkData,
    fromId: string,
    toId: string,
    options: JourneyOptions
): Result<Journey[]> => {
    const stations = new Set(
        network.lines.flatMap((l) => l.stations.map((s) => s.id))
    );
    for (const id of [fromId, toId]) {
        if (!stations.has(id)) {
            return err({
                code: 'UNKNOWN_STATION',
                stationId: id,
                lineId: null,
            });
        }
    }
    if (fromId === toId) {
        return err({ code: 'SAME_STATION', stationId: fromId });
    }

    let found = search(network, fromId, toId, options, true);
    if (found.filter(Boolean).length === 0) {
        found = search(network, fromId, toId, options, false);
    }

    const ranked = found
        .filter(Boolean)
        .map((path) => ({
            path,
            last: path[path.length - 1],
            transfers: path.filter((l) => l.transfer).length,
        }))
        .sort(
            (a, b) =>
                a.last.unknownWalks - b.last.unknownWalks ||
                a.last.cost - b.last.cost ||
                a.transfers - b.transfers
        );
    if (ranked.length === 0) {
        return err({ code: 'NO_ROUTE', from: fromId, to: toId });
    }

    // Drop options that are no faster than one with fewer transfers.
    const kept = ranked.filter(
        (r) =>
            !ranked.some(
                (o) =>
                    o !== r &&
                    o.transfers < r.transfers &&
                    o.last.cost <= r.last.cost
            )
    );
    return ok(kept.map((r) => toJourney(fromId, toId, r.path)));
};

/** The recommended journey (first of `planJourneys`). */
export const planJourney = (
    network: NetworkData,
    fromId: string,
    toId: string,
    options: JourneyOptions
): Result<Journey> => {
    const journeys = planJourneys(network, fromId, toId, options);
    return journeys.ok ? ok(journeys.value[0]) : journeys;
};

export interface JourneyPosition {
    /** Index into `journey.legs`. */
    legIndex: number;
    position: RidePosition;
    /** Ride seconds since the first departure (waits and walks excluded). */
    elapsedSeconds: number;
    /** 0–1 over the whole journey's ride time. */
    progress: number;
}

/**
 * Where the train is `elapsedSeconds` of *ride* time into the journey. The
 * animation plays ride time only — waits and walks are shown on the card —
 * so its length is exactly `journey.rideSeconds`.
 */
export const journeyPositionAt = (
    journey: Journey,
    elapsedSeconds: number
): JourneyPosition => {
    const t = Math.min(Math.max(elapsedSeconds, 0), journey.rideSeconds);
    let before = 0;
    for (let i = 0; i < journey.legs.length; i += 1) {
        const leg = journey.legs[i].plan;
        const isLast = i === journey.legs.length - 1;
        if (t < before + leg.totalSeconds || isLast) {
            return {
                legIndex: i,
                position: positionAt(leg, t - before),
                elapsedSeconds: t,
                progress: journey.rideSeconds > 0 ? t / journey.rideSeconds : 1,
            };
        }
        before += leg.totalSeconds;
    }
    throw new Error('journey has no legs');
};
