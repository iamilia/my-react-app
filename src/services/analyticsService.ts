/**
 * Talks to the analytics endpoints served by my-express-app under `/_a`.
 *
 * Same-origin on purpose: no CORS preflight, no third-party domain for
 * blockers to recognise, and nothing to configure per environment.
 */

const BASE = '/_a';

export interface DayStats {
    date: string;
    views: number;
    visitors: number;
    paths: Record<string, number>;
    referrers: Record<string, number>;
    countries: Record<string, number>;
    devices: Record<string, number>;
    browsers: Record<string, number>;
    os: Record<string, number>;
    langs: Record<string, number>;
    /** 24 slots, index = hour of day in the server's timezone */
    hours: number[];
}

export interface StatsResponse {
    tz: string;
    today: string;
    days: DayStats[];
    lifetime: { views: number; visitors: number; since: string };
}

export class StatsError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'StatsError';
        this.status = status;
    }
}

/**
 * Fire-and-forget pageview. `sendBeacon` survives the page being closed mid
 * flight, which a `fetch` from an unloading document does not.
 */
export function sendHit(path: string): void {
    const payload = JSON.stringify({
        path,
        referrer: document.referrer,
        lang: navigator.language,
    });

    try {
        if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' });
            if (navigator.sendBeacon(`${BASE}/hit`, blob)) return;
        }

        void fetch(`${BASE}/hit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
        }).catch(() => {});
    } catch {
        // Analytics must never break the page it is measuring.
    }
}

export async function fetchStats(
    token: string,
    days: number
): Promise<StatsResponse> {
    const res = await fetch(`${BASE}/stats?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new StatsError(
            body.message ?? body.error ?? `HTTP ${res.status}`,
            res.status
        );
    }

    return (await res.json()) as StatsResponse;
}

/* --------------------------------- helpers -------------------------------- */

export type Entry = { key: string; value: number };

/** Sums one counter field across a range of days and sorts it, biggest first. */
export function topOf(
    days: DayStats[],
    field: 'paths' | 'referrers' | 'countries' | 'devices' | 'browsers' | 'os',
    limit = 8
): Entry[] {
    const total: Record<string, number> = {};

    for (const day of days) {
        for (const [key, value] of Object.entries(day[field])) {
            total[key] = (total[key] ?? 0) + value;
        }
    }

    return Object.entries(total)
        .map(([key, value]) => ({ key, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
}

export function sumViews(days: DayStats[]): number {
    return days.reduce((n, day) => n + day.views, 0);
}

/**
 * Visitor counts are unique *per day*, so summing them over a range
 * double-counts anyone who came back. It is the best estimate the daily
 * rollup can give, and the dashboard labels it as such.
 */
export function sumVisitors(days: DayStats[]): number {
    return days.reduce((n, day) => n + day.visitors, 0);
}
