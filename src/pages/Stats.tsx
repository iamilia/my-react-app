import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    IconAlertTriangle,
    IconEye,
    IconLogout,
    IconRefresh,
    IconUsers,
} from '@tabler/icons-react';
import { SubPageShell } from '../components/SubPageShell';
import { useStatsAuthStore } from '../store/statsAuthStore';
import {
    fetchStats,
    StatsError,
    sumViews,
    sumVisitors,
    topOf,
    type DayStats,
    type Entry,
    type StatsResponse,
} from '../services/analyticsService';

const RANGES = [7, 30, 90] as const;

const num = (n: number) => n.toLocaleString('en-US');

/* ------------------------------- small parts ------------------------------ */

const Kpi = ({
    label,
    value,
    hint,
    icon,
}: {
    label: string;
    value: string;
    hint?: string;
    icon: React.ReactNode;
}) => (
    <div className="card">
        <div className="text-muted flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
            {icon}
            {label}
        </div>
        <div className="display display-md mt-3 tabular-nums">{value}</div>
        {hint && <div className="text-muted mt-1 text-xs">{hint}</div>}
    </div>
);

/** Daily columns. Heights are relative to the busiest day in the range. */
const DailyChart = ({ days }: { days: DayStats[] }) => {
    const peak = Math.max(1, ...days.map((d) => d.views));

    return (
        <div className="card">
            <div className="text-muted mb-4 flex items-baseline justify-between font-mono text-xs tracking-wider uppercase">
                <span>Views per day</span>
                <span className="normal-case">peak {num(peak)}</span>
            </div>

            <div
                className="ltr-run flex h-40 items-end gap-px"
                dir="ltr"
                role="img"
                aria-label={`Daily views from ${days[0]?.date} to ${days[days.length - 1]?.date}`}
            >
                {days.map((day) => (
                    <div
                        key={day.date}
                        className="group relative flex-1"
                        style={{ height: '100%' }}
                    >
                        <div className="flex h-full flex-col justify-end">
                            <div
                                className="min-h-px w-full bg-(--accent) opacity-70 transition-opacity group-hover:opacity-100"
                                style={{
                                    height: `${(day.views / peak) * 100}%`,
                                }}
                            />
                        </div>
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 border border-(--line) bg-(--bg-alt) px-2 py-1 font-mono text-[10px] whitespace-nowrap group-hover:block">
                            {day.date} · {num(day.views)} views ·{' '}
                            {num(day.visitors)} visitors
                        </span>
                    </div>
                ))}
            </div>

            <div
                className="text-muted ltr-run mt-2 flex justify-between font-mono text-[10px]"
                dir="ltr"
            >
                <span>{days[0]?.date}</span>
                <span>{days[days.length - 1]?.date}</span>
            </div>
        </div>
    );
};

/** Hour-of-day histogram, summed over the whole range. */
const HourChart = ({ days, tz }: { days: DayStats[]; tz: string }) => {
    const hours = useMemo(() => {
        const out = new Array(24).fill(0) as number[];
        for (const day of days) {
            day.hours.forEach((n, i) => (out[i] += n));
        }
        return out;
    }, [days]);

    const peak = Math.max(1, ...hours);

    return (
        <div className="card">
            <div className="text-muted mb-4 flex items-baseline justify-between font-mono text-xs tracking-wider uppercase">
                <span>Views by hour</span>
                <span className="normal-case">{tz}</span>
            </div>

            <div className="ltr-run flex h-24 items-end gap-0.5" dir="ltr">
                {hours.map((n, i) => (
                    <div key={i} className="group relative flex-1">
                        <div className="flex h-24 flex-col justify-end">
                            <div
                                className="min-h-px w-full bg-(--accent) opacity-60 transition-opacity group-hover:opacity-100"
                                style={{ height: `${(n / peak) * 100}%` }}
                            />
                        </div>
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 border border-(--line) bg-(--bg-alt) px-2 py-1 font-mono text-[10px] whitespace-nowrap group-hover:block">
                            {String(i).padStart(2, '0')}:00 · {num(n)}
                        </span>
                    </div>
                ))}
            </div>

            <div
                className="text-muted ltr-run mt-2 flex justify-between font-mono text-[10px]"
                dir="ltr"
            >
                <span>00</span>
                <span>12</span>
                <span>23</span>
            </div>
        </div>
    );
};

/** Ranked list where each row carries its own share as a background bar. */
const TopList = ({
    title,
    entries,
    empty = 'no data yet',
}: {
    title: string;
    entries: Entry[];
    empty?: string;
}) => {
    const peak = Math.max(1, ...entries.map((e) => e.value));

    return (
        <div className="card">
            <div className="text-muted mb-3 font-mono text-xs tracking-wider uppercase">
                {title}
            </div>

            {entries.length === 0 ? (
                <p className="prose-sm">{empty}</p>
            ) : (
                <ul className="m-0 list-none space-y-1 p-0">
                    {entries.map((entry) => (
                        <li
                            key={entry.key}
                            className="ltr-run relative flex items-center justify-between gap-3 px-2 py-1.5 text-sm"
                            dir="ltr"
                        >
                            <span
                                aria-hidden
                                className="absolute inset-y-0 left-0 bg-(--accent-soft)"
                                style={{
                                    width: `${(entry.value / peak) * 100}%`,
                                }}
                            />
                            <span className="relative min-w-0 truncate font-mono text-xs">
                                {entry.key}
                            </span>
                            <span className="relative shrink-0 font-mono text-xs tabular-nums">
                                {num(entry.value)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

/* -------------------------------- the page -------------------------------- */

const TokenGate = ({
    onSubmit,
    error,
}: {
    onSubmit: (token: string) => void;
    error: string | null;
}) => {
    const [value, setValue] = useState('');

    return (
        <div className="mx-auto max-w-sm">
            <h1 className="display display-md">Analytics</h1>
            <p className="prose-sm mt-2">
                Enter the value of{' '}
                <code className="font-mono">ANALYTICS_TOKEN</code> from the
                server environment.
            </p>

            <form
                className="mt-6 flex flex-col gap-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (value.trim()) onSubmit(value.trim());
                }}
            >
                <input
                    type="password"
                    autoComplete="current-password"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="token"
                    dir="ltr"
                    className="border border-(--line-strong) bg-transparent px-3 py-2.5 font-mono text-sm outline-none focus:border-(--accent)"
                />
                <button type="submit" className="btn">
                    Open dashboard
                </button>
            </form>

            {error && (
                <p className="text-accent mt-4 flex items-start gap-2 text-sm">
                    <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
};

export const Stats = () => {
    const token = useStatsAuthStore((s) => s.token);
    const signIn = useStatsAuthStore((s) => s.signIn);
    const signOut = useStatsAuthStore((s) => s.signOut);
    const [days, setDays] = useState<number>(30);
    const [data, setData] = useState<StatsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Lets an in-flight request know it has been superseded, so a slow reply
    // for "90 days" can't overwrite a fresh reply for "7 days".
    const requestId = useRef(0);

    useEffect(() => {
        document.title = 'Analytics — Ilia';

        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex, nofollow';
        document.head.appendChild(meta);

        return () => {
            meta.remove();
        };
    }, []);

    const load = useCallback(
        async (activeToken: string, activeDays: number) => {
            const id = ++requestId.current;
            setLoading(true);
            setError(null);

            try {
                const res = await fetchStats(activeToken, activeDays);
                if (id !== requestId.current) return;
                setData(res);
            } catch (err) {
                if (id !== requestId.current) return;

                if (err instanceof StatsError && err.status === 401) {
                    signOut();
                    setData(null);
                    setError('Wrong token.');
                    return;
                }

                setError(
                    err instanceof Error ? err.message : 'Could not load stats.'
                );
            } finally {
                if (id === requestId.current) setLoading(false);
            }
        },
        [signOut]
    );

    useEffect(() => {
        if (token) void load(token, days);
    }, [token, days, load]);

    const handleSignOut = () => {
        signOut();
        setData(null);
        setError(null);
    };

    const view = useMemo(() => {
        if (!data) return null;

        const today = data.days[data.days.length - 1];

        return {
            today,
            rangeViews: sumViews(data.days),
            rangeVisitors: sumVisitors(data.days),
            paths: topOf(data.days, 'paths'),
            referrers: topOf(data.days, 'referrers'),
            countries: topOf(data.days, 'countries'),
            devices: topOf(data.days, 'devices', 4),
            browsers: topOf(data.days, 'browsers', 6),
            os: topOf(data.days, 'os', 6),
        };
    }, [data]);

    if (!token) {
        return (
            <SubPageShell>
                <TokenGate onSubmit={signIn} error={error} />
            </SubPageShell>
        );
    }

    return (
        <SubPageShell>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="display display-md">Analytics</h1>
                    <p className="text-muted mt-1 font-mono text-xs">
                        {data
                            ? `${data.today} · ${data.tz}`
                            : loading
                              ? 'loading…'
                              : '—'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {RANGES.map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setDays(r)}
                            aria-pressed={days === r}
                            className={`tag cursor-pointer ${
                                days === r
                                    ? 'border-(--accent) text-(--accent)'
                                    : ''
                            }`}
                        >
                            {r}d
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => token && load(token, days)}
                        className="tag cursor-pointer"
                        aria-label="Refresh"
                    >
                        <IconRefresh
                            size={13}
                            className={loading ? 'animate-spin' : ''}
                        />
                        refresh
                    </button>

                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="tag cursor-pointer"
                        aria-label="Forget token"
                    >
                        <IconLogout size={13} />
                        exit
                    </button>
                </div>
            </div>

            {error && (
                <p className="text-accent mt-6 flex items-start gap-2 text-sm">
                    <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
                    {error}
                </p>
            )}

            {view && data && (
                <div className="mt-8 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Kpi
                            icon={<IconEye size={13} />}
                            label="Views today"
                            value={num(view.today?.views ?? 0)}
                            hint={`${num(view.today?.visitors ?? 0)} visitors`}
                        />
                        <Kpi
                            icon={<IconEye size={13} />}
                            label={`Views · ${days}d`}
                            value={num(view.rangeViews)}
                        />
                        <Kpi
                            icon={<IconUsers size={13} />}
                            label={`Visitors · ${days}d`}
                            value={num(view.rangeVisitors)}
                            hint="daily uniques, summed"
                        />
                        <Kpi
                            icon={<IconEye size={13} />}
                            label="All time"
                            value={num(data.lifetime.views)}
                            hint={`since ${data.lifetime.since}`}
                        />
                    </div>

                    <DailyChart days={data.days} />

                    <div className="grid gap-4 lg:grid-cols-2">
                        <TopList title="Pages" entries={view.paths} />
                        <TopList title="Referrers" entries={view.referrers} />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <TopList title="Countries" entries={view.countries} />
                        <TopList title="Devices" entries={view.devices} />
                        <TopList title="Browsers" entries={view.browsers} />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <TopList title="Operating systems" entries={view.os} />
                        <HourChart days={data.days} tz={data.tz} />
                    </div>
                </div>
            )}

            {!view && !error && <p className="prose-sm mt-8">Loading…</p>}
        </SubPageShell>
    );
};
