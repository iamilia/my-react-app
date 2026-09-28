/**
 * Data model for schedule-based metro estimates.
 *
 * Everything here is plain data + plain functions: no DOM, no React, no
 * bundler-only imports, so the same module runs in the browser and in Node
 * (the Express app can import it and feed it JSON read from disk).
 *
 * A timing value that the source timetable does not provide is `null`, never
 * a guess. Functions that need a `null` value return a typed error instead of
 * a number.
 */

/**
 * Day types used by the published timetables. The files have three sheets per
 * direction: Saturday–Wednesday, Thursday, and Friday / public holiday.
 */
export type DayType = 'weekday' | 'thursday' | 'holiday';

export const DAY_TYPES: readonly DayType[] = ['weekday', 'thursday', 'holiday'];

/**
 * `forward` runs in the order of `LineData.stations` (index 0 → last),
 * `backward` the other way.
 */
export type Direction = 'forward' | 'backward';

export interface Station {
    /**
     * Network-wide id. An interchange keeps the same id on every line it
     * serves (e.g. `darvazeh-dowlat` on lines 1 and 4), which is what the
     * journey planner joins lines on.
     */
    id: string;
    fa: string;
    en: string | null;
}

/** Wall-clock "HH:MM", 24-hour, Tehran local time. */
export type ClockTime = string;

export interface HeadwayBand {
    /** Departure (at the pattern's first station) that opens the band. */
    from: ClockTime;
    /** Departure that closes it (inclusive only for the last band). */
    to: ClockTime;
    /** Minutes between trains, or `null` when the source is missing it. */
    minutes: number | null;
}

/**
 * One kind of trip in one direction: trains that start at `from` and end at
 * `to`. Most lines have a single pattern per direction (terminal to
 * terminal); Line 1 also runs short Tajrish ↔ Shahr-e Rey trips.
 */
export interface ServicePattern {
    /** First station of these trips, in travel order. */
    from: string;
    /** Last station of these trips. */
    to: string;
    /** First / last departure at `from`. */
    firstDeparture: ClockTime;
    lastDeparture: ClockTime;
    /** Headway bands, times at `from`. */
    headways: HeadwayBand[];
}

/**
 * Segment times that apply only to trips leaving the direction's origin
 * terminal within `[from, to]` on `dayType` — e.g. Line 5 all-stops trains
 * held at Garmdareh for an express to overtake.
 */
export interface SegmentPeriod {
    dayType: DayType;
    from: ClockTime;
    to: ClockTime;
    segmentSeconds: (number | null)[];
}

export interface DirectionData {
    /** Station id of the terminus this direction runs towards. */
    towards: string;
    /**
     * `segmentSeconds[i]` = time from `stations[i]` to `stations[i + 1]` (or
     * the reverse, for `backward`) when travelling in this direction. Always
     * `stations.length - 1` entries, indexed the same way in both directions.
     */
    segmentSeconds: (number | null)[];
    /** Per-day-type replacements, only where they differ from the default. */
    segmentSecondsByDayType?: Partial<Record<DayType, (number | null)[]>>;
    /** Time-of-day replacements; they win over the day-type set. */
    segmentPeriods?: SegmentPeriod[];
    /** `null` when there is no sheet for that day type. */
    service: Record<DayType, ServicePattern[] | null>;
}

export interface LineData {
    id: string;
    name: { fa: string; en: string };
    /** Display colour only. */
    color: string;
    source: {
        file: string;
        sheets: string[];
        extractedOn: string;
        note?: string;
    };
    /**
     * `true` when segment times are station-to-station timetable times,
     * i.e. dwell at intermediate stations is already inside them.
     */
    segmentsIncludeDwell: boolean;
    /** Only used when `segmentsIncludeDwell` is false. */
    dwellSeconds: number | null;
    stations: Station[];
    directions: Record<Direction, DirectionData>;
    /** Human-readable list of data the source did not have. */
    missing?: string[];
}

/* --------------------------------- network -------------------------------- */

export interface Transfer {
    /** Interchange station (same id on every line it serves). */
    stationId: string;
    /**
     * Platform-to-platform walking time. Not in the timetables — `null`
     * until someone measures it; journeys through it then have no total.
     */
    walkSeconds: number | null;
}

export interface NetworkData {
    lines: LineData[];
    transfers: Transfer[];
}

/* --------------------------------- results -------------------------------- */

export type MetroError =
    /** `lineId` is `null` when the station was looked up network-wide. */
    | { code: 'UNKNOWN_STATION'; stationId: string; lineId: string | null }
    | { code: 'SAME_STATION'; stationId: string }
    | {
          code: 'MISSING_SEGMENT_TIME';
          lineId: string;
          direction: Direction;
          /** The two station ids the missing segment joins. */
          between: [string, string];
      }
    | {
          code: 'MISSING_DWELL_TIME';
          lineId: string;
      }
    | {
          code: 'NO_SERVICE_DATA';
          lineId: string;
          direction: Direction;
          dayType: DayType;
      }
    | {
          code: 'MISSING_HEADWAY';
          lineId: string;
          direction: Direction;
          dayType: DayType;
          /** The band with `minutes: null`, or `null` if no band covers the time. */
          band: HeadwayBand | null;
      }
    | { code: 'NO_ROUTE'; from: string; to: string }
    | {
          code: 'OUT_OF_SERVICE';
          lineId: string;
          direction: Direction;
          dayType: DayType;
          /** First / last train at the rider's origin station, seconds of day. */
          firstAtStation: number;
          lastAtStation: number;
      }
    | { code: 'INVALID_TIME'; value: string }
    | { code: 'INVALID_LINE_DATA'; path: string; message: string };

export type MetroErrorCode = MetroError['code'];

export type Result<T, E = MetroError> =
    | { ok: true; value: T }
    | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
