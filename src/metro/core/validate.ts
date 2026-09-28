import { parseClock } from './time';
import {
    DAY_TYPES,
    type DayType,
    type DirectionData,
    err,
    type LineData,
    type MetroError,
    ok,
    type Result,
    type SegmentPeriod,
    type ServicePattern,
    type Transfer,
} from './types';

type Invalid = Extract<MetroError, { code: 'INVALID_LINE_DATA' }>;

class LineDataError extends Error {
    readonly path: string;

    constructor(path: string, message: string) {
        super(message);
        this.path = path;
    }
}

const fail = (path: string, message: string): never => {
    throw new LineDataError(path, message);
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);

const record = (v: unknown, path: string) =>
    isRecord(v) ? v : fail(path, 'expected an object');

const string = (v: unknown, path: string): string =>
    typeof v === 'string' && v.length > 0
        ? v
        : fail(path, 'expected a non-empty string');

const nullableString = (v: unknown, path: string): string | null =>
    v === null ? null : string(v, path);

const positiveOrNull = (v: unknown, path: string): number | null =>
    v === null
        ? null
        : typeof v === 'number' && Number.isFinite(v) && v > 0
          ? v
          : fail(path, 'expected a positive number or null');

const clock = (v: unknown, path: string): string => {
    const value = string(v, path);
    return parseClock(value).ok ? value : fail(path, 'expected "HH:MM"');
};

const segmentList = (
    v: unknown,
    length: number,
    path: string
): (number | null)[] => {
    if (!Array.isArray(v) || v.length !== length) {
        fail(path, `expected an array of ${length} segment times`);
    }
    return (v as unknown[]).map((x, i) => positiveOrNull(x, `${path}[${i}]`));
};

const bands = (v: unknown, path: string) => {
    if (!Array.isArray(v) || v.length === 0) {
        fail(path, 'expected at least one band');
    }
    return (v as unknown[]).map((b, i) => {
        const p = `${path}[${i}]`;
        const band = record(b, p);
        return {
            from: clock(band.from, `${p}.from`),
            to: clock(band.to, `${p}.to`),
            minutes: positiveOrNull(band.minutes, `${p}.minutes`),
        };
    });
};

const patterns = (
    v: unknown,
    stationIds: Set<string>,
    path: string
): ServicePattern[] | null => {
    if (v === null) return null;
    if (!Array.isArray(v) || v.length === 0) {
        fail(path, 'expected at least one service pattern, or null');
    }
    return (v as unknown[]).map((x, i) => {
        const p = `${path}[${i}]`;
        const o = record(x, p);
        const from = string(o.from, `${p}.from`);
        const to = string(o.to, `${p}.to`);
        if (!stationIds.has(from)) fail(`${p}.from`, 'unknown station');
        if (!stationIds.has(to)) fail(`${p}.to`, 'unknown station');
        return {
            from,
            to,
            firstDeparture: clock(o.firstDeparture, `${p}.firstDeparture`),
            lastDeparture: clock(o.lastDeparture, `${p}.lastDeparture`),
            headways: bands(o.headways, `${p}.headways`),
        };
    });
};

const isDayType = (v: unknown): v is DayType =>
    DAY_TYPES.includes(v as DayType);

const direction = (
    v: unknown,
    segments: number,
    stationIds: Set<string>,
    path: string
): DirectionData => {
    const o = record(v, path);
    const towards = string(o.towards, `${path}.towards`);
    if (!stationIds.has(towards)) fail(`${path}.towards`, 'unknown station');

    const services = record(o.service, `${path}.service`);
    const data: DirectionData = {
        towards,
        segmentSeconds: segmentList(
            o.segmentSeconds,
            segments,
            `${path}.segmentSeconds`
        ),
        service: {
            weekday: patterns(
                services.weekday,
                stationIds,
                `${path}.service.weekday`
            ),
            thursday: patterns(
                services.thursday,
                stationIds,
                `${path}.service.thursday`
            ),
            holiday: patterns(
                services.holiday,
                stationIds,
                `${path}.service.holiday`
            ),
        },
    };

    if (o.segmentPeriods !== undefined) {
        if (!Array.isArray(o.segmentPeriods)) {
            fail(`${path}.segmentPeriods`, 'expected an array');
        }
        data.segmentPeriods = (o.segmentPeriods as unknown[]).map(
            (x, i): SegmentPeriod => {
                const p = `${path}.segmentPeriods[${i}]`;
                const period = record(x, p);
                if (!isDayType(period.dayType)) {
                    fail(`${p}.dayType`, 'expected a day type');
                }
                return {
                    dayType: period.dayType as DayType,
                    from: clock(period.from, `${p}.from`),
                    to: clock(period.to, `${p}.to`),
                    segmentSeconds: segmentList(
                        period.segmentSeconds,
                        segments,
                        `${p}.segmentSeconds`
                    ),
                };
            }
        );
    }

    if (o.segmentSecondsByDayType !== undefined) {
        const byDay = record(
            o.segmentSecondsByDayType,
            `${path}.segmentSecondsByDayType`
        );
        data.segmentSecondsByDayType = {};
        for (const day of DAY_TYPES) {
            if (byDay[day] === undefined) continue;
            data.segmentSecondsByDayType[day] = segmentList(
                byDay[day],
                segments,
                `${path}.segmentSecondsByDayType.${day}`
            );
        }
    }
    return data;
};

/**
 * Checks untyped JSON against `LineData`. JSON imports are typed loosely by
 * TypeScript (`string` instead of the unions), so every line goes through
 * here once, at load, rather than being cast.
 */
export const parseLineData = (input: unknown): Result<LineData, Invalid> => {
    try {
        const o = record(input, '$');
        const id = string(o.id, '$.id');
        const name = record(o.name, '$.name');
        const source = record(o.source, '$.source');

        if (!Array.isArray(o.stations) || o.stations.length < 2) {
            fail('$.stations', 'expected at least two stations');
        }
        const stations = (o.stations as unknown[]).map((s, i) => {
            const st = record(s, `$.stations[${i}]`);
            return {
                id: string(st.id, `$.stations[${i}].id`),
                fa: string(st.fa, `$.stations[${i}].fa`),
                en: nullableString(st.en, `$.stations[${i}].en`),
            };
        });
        const ids = new Set(stations.map((s) => s.id));
        if (ids.size !== stations.length) {
            fail('$.stations', 'station ids must be unique');
        }

        if (typeof o.segmentsIncludeDwell !== 'boolean') {
            fail('$.segmentsIncludeDwell', 'expected a boolean');
        }

        const directions = record(o.directions, '$.directions');
        const segments = stations.length - 1;

        return ok({
            id,
            name: {
                fa: string(name.fa, '$.name.fa'),
                en: string(name.en, '$.name.en'),
            },
            color: string(o.color, '$.color'),
            source: {
                file: string(source.file, '$.source.file'),
                sheets: Array.isArray(source.sheets)
                    ? source.sheets.map((x, i) =>
                          string(x, `$.source.sheets[${i}]`)
                      )
                    : fail('$.source.sheets', 'expected an array'),
                extractedOn: string(source.extractedOn, '$.source.extractedOn'),
                note:
                    source.note === undefined
                        ? undefined
                        : string(source.note, '$.source.note'),
            },
            segmentsIncludeDwell: o.segmentsIncludeDwell as boolean,
            dwellSeconds: positiveOrNull(o.dwellSeconds, '$.dwellSeconds'),
            stations,
            directions: {
                forward: direction(
                    directions.forward,
                    segments,
                    ids,
                    '$.directions.forward'
                ),
                backward: direction(
                    directions.backward,
                    segments,
                    ids,
                    '$.directions.backward'
                ),
            },
            missing: Array.isArray(o.missing)
                ? o.missing.map((x, i) => string(x, `$.missing[${i}]`))
                : undefined,
        });
    } catch (e) {
        if (e instanceof LineDataError) {
            return err({
                code: 'INVALID_LINE_DATA',
                path: e.path,
                message: e.message,
            });
        }
        throw e;
    }
};

/** Checks the interchange walking-time table. */
export const parseTransfers = (input: unknown): Result<Transfer[], Invalid> => {
    try {
        const o = record(input, '$');
        const list = o.transfers;
        if (!Array.isArray(list)) fail('$.transfers', 'expected an array');
        return ok(
            (list as unknown[]).map((x, i) => {
                const p = `$.transfers[${i}]`;
                const t = record(x, p);
                return {
                    stationId: string(t.stationId, `${p}.stationId`),
                    walkSeconds: positiveOrNull(
                        t.walkSeconds,
                        `${p}.walkSeconds`
                    ),
                };
            })
        );
    } catch (e) {
        if (e instanceof LineDataError) {
            return err({
                code: 'INVALID_LINE_DATA',
                path: e.path,
                message: e.message,
            });
        }
        throw e;
    }
};
