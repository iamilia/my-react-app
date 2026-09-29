import { IconArrowsUpDown, IconClockPlay } from '@tabler/icons-react';
import {
    AnimatePresence,
    MotionConfig,
    motion,
    useTransform,
} from 'motion/react';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SubPageShell } from '../components/SubPageShell';
import {
    approachingTrains,
    DAY_TYPES,
    type DayType,
    formatClock,
    networkStations,
    parseClock,
    planJourneys,
    stationBoard,
    tehranClock,
} from '../metro/core';
import { DEFAULT_ROUTE, LINES, NETWORK } from '../metro/data/lines';
import { JourneyCard } from '../metro/JourneyCard';
import { LiveTrains } from '../metro/LiveTrains';
import { stationNamer } from '../metro/messages';
import { NetworkBar } from '../metro/NetworkBar';
import { PlaybackBar } from '../metro/PlaybackBar';
import { RouteDiagram2D } from '../metro/RouteDiagram2D';
import { SceneErrorBoundary } from '../metro/SceneErrorBoundary';
import { StationBoard } from '../metro/StationBoard';
import { StationPicker } from '../metro/StationPicker';
import { useLiveSeconds } from '../metro/useLiveSeconds';
import {
    DEFAULT_SPEED,
    type Speed,
    useRidePlayback,
} from '../metro/useRidePlayback';
import { type SceneView, useSceneMode } from '../metro/useSceneMode';
import { useLanguageStore } from '../store/languageStore';
import { useThemeStore } from '../store/themeStore';

/**
 * three + R3F + drei are the heavy part of this page; they load only when
 * this page decides to show the 3D view. The route itself is lazy too
 * (App.tsx), so none of this is in the bundle the home page ships.
 */
const RouteScene3D = lazy(() =>
    import('../metro/RouteScene3D').then((m) => ({ default: m.RouteScene3D }))
);

const ease = [0.22, 1, 0.36, 1] as const;
const STATIONS = networkStations(NETWORK);

export const Metro = () => {
    const { t } = useTranslation();
    const language = useLanguageStore((s) => s.language);
    const dark = useThemeStore((s) => s.darkMode);
    const scene = useSceneMode();

    const [from, setFrom] = useState<string>(DEFAULT_ROUTE.from);
    const [to, setTo] = useState<string>(DEFAULT_ROUTE.to);

    const [initial] = useState(() => tehranClock(new Date()));
    const [dayType, setDayType] = useState<DayType>(initial.dayType);
    const [time, setTime] = useState(formatClock(initial.secondsOfDay));
    const [speed, setSpeed] = useState<Speed>(DEFAULT_SPEED);
    const [view, setView] = useState<SceneView>('journey');
    // The "every train" clock runs in real time unless asked otherwise.
    const [networkSpeed, setNetworkSpeed] = useState<Speed>(1);

    useEffect(() => {
        document.title = `${t('metro.title')} — ${t('navigation.userName')}`;
    }, [t]);

    // A bad or empty time only costs the waits; routes and rides still work.
    const journeys = useMemo(() => {
        const clock = parseClock(time);
        return planJourneys(NETWORK, from, to, {
            dayType,
            secondsOfDay: clock.ok ? clock.value : null,
        });
    }, [from, to, dayType, time]);

    // The chosen alternative resets whenever the question changes.
    const question = `${from}>${to}|${dayType}|${time}`;
    const [choice, setChoice] = useState({ question, index: 0 });
    const selected = choice.question === question ? choice.index : 0;
    const journey = journeys.ok
        ? (journeys.value[selected] ?? journeys.value[0])
        : null;

    const rideKey = journey
        ? journey.legs
              .map(
                  (l) =>
                      `${l.lineId}:${l.plan.stationIds[0]}>${l.plan.stationIds.at(-1)}:${l.plan.totalSeconds}`
              )
              .join('|')
        : 'none';
    const playback = useRidePlayback(
        rideKey,
        journey?.rideSeconds ?? 0,
        speed,
        !scene.reducedMotion
    );

    // Every-train view: a clock from the chosen time to the end of the day.
    const clockStart = (() => {
        const parsed = parseClock(time);
        return parsed.ok ? parsed.value : initial.secondsOfDay;
    })();
    const networkPlayback = useRidePlayback(
        `${clockStart}|${dayType}|${view}`,
        86_400 - clockStart,
        networkSpeed,
        view === 'network' && !scene.reducedMotion
    );
    const clock = useTransform(networkPlayback.elapsed, (e) => clockStart + e);

    // "Where are my trains?" runs on a plain wall clock from the same time.
    const now = useLiveSeconds(clockStart);
    const liveTrains = useMemo(
        () =>
            journey
                ? journey.legs.flatMap((leg) =>
                      approachingTrains(
                          NETWORK,
                          leg.lineId,
                          leg.plan.stationIds[0],
                          leg.plan.stationIds[leg.plan.stationIds.length - 1],
                          dayType,
                          now
                      ).flatMap((a) => (a.train ? [a.train] : []))
                  )
                : [],
        [journey, dayType, now]
    );
    // "When does the train come to my station?" — every line leaving From.
    const board = useMemo(
        () => stationBoard(NETWORK, from, dayType, now),
        [from, dayType, now]
    );
    const firstLeg = journey?.legs[0];
    const boarding = firstLeg
        ? { lineId: firstLeg.lineId, direction: firstLeg.plan.direction }
        : null;

    const resetToNow = () => {
        const now = tehranClock(new Date());
        setDayType(now.dayType);
        setTime(formatClock(now.secondsOfDay));
    };

    const nameOf = stationNamer(STATIONS, language);
    const sceneLabel = t('metro.scene.label', {
        from: nameOf(from),
        to: nameOf(to),
    });

    const diagram = journey && (
        <RouteDiagram2D
            network={NETWORK}
            stations={STATIONS}
            journey={journey}
            elapsed={playback.elapsed}
            view={view}
            clock={clock}
            dayType={dayType}
            liveTrains={liveTrains}
            language={language}
            label={sceneLabel}
        />
    );
    const journeyLines =
        view === 'network'
            ? LINES
            : journey
              ? [...new Set(journey.legs.map((l) => l.lineId))]
                    .map((id) => LINES.find((l) => l.id === id))
                    .filter((l) => l !== undefined)
              : [];

    return (
        <MotionConfig reducedMotion="user">
            <SubPageShell title={t('navigation.metro')}>
                <header className="max-w-3xl">
                    <span className="label">{t('navigation.metro')}</span>
                    <h1 className="display display-lg mt-2">
                        {t('metro.title')}
                    </h1>
                    <p className="lede mt-4">{t('metro.subtitle')}</p>
                </header>

                <hr className="rule-heavy mt-8" />

                <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:gap-8">
                    {/* --- controls + result -------------------------------- */}
                    <motion.div
                        className="flex min-w-0 flex-col gap-6"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease }}
                    >
                        <form
                            className="card gap-5"
                            onSubmit={(e) => e.preventDefault()}
                            aria-label={t('metro.form.label')}
                        >
                            {/* Stacked, with the swap button beside both:
                                station names are long in either script and
                                need the full width of the panel. */}
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-4">
                                <StationPicker
                                    label={t('metro.form.from')}
                                    lines={LINES}
                                    stations={STATIONS}
                                    value={from}
                                    onChange={setFrom}
                                    language={language}
                                    disabledId={to}
                                />
                                <motion.button
                                    type="button"
                                    onClick={() => {
                                        setFrom(to);
                                        setTo(from);
                                    }}
                                    whileTap={{ rotate: 180, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="btn-outline row-span-2 size-11 min-h-0! rounded-full! p-0!"
                                    aria-label={t('metro.form.swap')}
                                    title={t('metro.form.swap')}
                                >
                                    <IconArrowsUpDown size={18} aria-hidden />
                                </motion.button>
                                <StationPicker
                                    label={t('metro.form.to')}
                                    lines={LINES}
                                    stations={STATIONS}
                                    value={to}
                                    onChange={setTo}
                                    language={language}
                                    disabledId={from}
                                />
                            </div>

                            <fieldset className="m-0 border-0 p-0">
                                <legend className="label">
                                    {t('metro.form.dayType')}
                                </legend>
                                <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl border border-(--line) p-1">
                                    {DAY_TYPES.map((d) => (
                                        <label
                                            key={d}
                                            className={`cursor-pointer rounded-lg px-2 py-2 text-center text-xs font-semibold transition-colors ${
                                                dayType === d
                                                    ? 'bg-(--accent-soft) text-(--accent)'
                                                    : 'text-muted hover:text-(--fg)'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="metro-day-type"
                                                value={d}
                                                checked={dayType === d}
                                                onChange={() => setDayType(d)}
                                                className="sr-only"
                                            />
                                            {t(`metro.dayTypes.${d}`)}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <div className="flex items-end gap-2">
                                <label className="min-w-0 flex-1">
                                    <span className="label">
                                        {t('metro.form.time')}
                                    </span>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) =>
                                            setTime(e.target.value)
                                        }
                                        dir="ltr"
                                        className="mt-2 w-full rounded-xl border border-(--line-strong) bg-(--bg) px-4 py-2.5 font-mono text-(--fg)"
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={resetToNow}
                                    className="btn-outline min-h-11! px-4!"
                                >
                                    <IconClockPlay size={16} aria-hidden />
                                    {t('metro.form.now')}
                                </button>
                            </div>
                        </form>

                        <StationBoard
                            lines={LINES}
                            stations={STATIONS}
                            stationId={from}
                            board={board}
                            boarding={boarding}
                            language={language}
                        />

                        <JourneyCard
                            lines={LINES}
                            stations={STATIONS}
                            journeys={journeys}
                            selected={selected}
                            onSelect={(index) => setChoice({ question, index })}
                            language={language}
                        />
                    </motion.div>

                    {/* --- scene ---------------------------------------------- */}
                    <motion.section
                        className="min-w-0"
                        aria-label={t('metro.scene.title')}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.08, ease }}
                    >
                        <fieldset className="m-0 mb-3 grid grid-cols-2 gap-1 rounded-xl border border-(--line) p-1 sm:inline-grid">
                            <legend className="sr-only">
                                {t('metro.view.label')}
                            </legend>
                            {(['journey', 'network'] as const).map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setView(v)}
                                    aria-pressed={view === v}
                                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                                        view === v
                                            ? 'bg-(--accent-soft) text-(--accent)'
                                            : 'text-muted hover:text-(--fg)'
                                    }`}
                                >
                                    {t(`metro.view.${v}`)}
                                </button>
                            ))}
                        </fieldset>

                        <div className="relative h-[21rem] overflow-hidden rounded-(--r-md) border border-(--line) bg-(--tint) sm:h-[27rem] lg:h-[34rem]">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={journey ? scene.mode : 'empty'}
                                    className="absolute inset-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {journey &&
                                        (scene.mode === '3d' ? (
                                            <SceneErrorBoundary
                                                fallback={diagram}
                                            >
                                                <Suspense fallback={diagram}>
                                                    <RouteScene3D
                                                        network={NETWORK}
                                                        stations={STATIONS}
                                                        journey={journey}
                                                        elapsed={
                                                            playback.elapsed
                                                        }
                                                        view={view}
                                                        clock={clock}
                                                        dayType={dayType}
                                                        liveTrains={liveTrains}
                                                        dark={dark}
                                                        language={language}
                                                        label={sceneLabel}
                                                    />
                                                </Suspense>
                                            </SceneErrorBoundary>
                                        ) : (
                                            diagram
                                        ))}
                                </motion.div>
                            </AnimatePresence>

                            {scene.canUse3D && (
                                <fieldset className="glass absolute end-3 top-3 z-30 m-0 flex gap-1 rounded-full border border-(--line) p-1">
                                    <legend className="sr-only">
                                        {t('metro.scene.view')}
                                    </legend>
                                    {(['3d', '2d'] as const).map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => scene.setMode(m)}
                                            aria-pressed={scene.mode === m}
                                            className={`force-mono rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                                                scene.mode === m
                                                    ? 'bg-(--accent) text-(--on-accent)'
                                                    : 'text-muted hover:text-(--fg)'
                                            }`}
                                        >
                                            {m.toUpperCase()}
                                        </button>
                                    ))}
                                </fieldset>
                            )}

                            <div className="pointer-events-none absolute start-3 top-3 z-30 flex max-w-[calc(100%-8rem)] flex-wrap gap-1.5">
                                {journeyLines.map((l) => (
                                    <span
                                        key={l.id}
                                        className="glass inline-flex items-center gap-1.5 rounded-full border border-(--line) px-2.5 py-1 text-xs font-semibold"
                                    >
                                        <span
                                            className="inline-block size-2.5 rounded-full"
                                            style={{ background: l.color }}
                                            aria-hidden
                                        />
                                        {l.name[language]}
                                    </span>
                                ))}
                            </div>

                            <span className="label pointer-events-none absolute start-3 bottom-3 z-30">
                                {t('metro.scene.schematic')}
                            </span>
                        </div>

                        {scene.reason && (
                            <p className="text-muted mt-2 text-xs">
                                {t(`metro.scene.fallback.${scene.reason}`)}
                            </p>
                        )}

                        {view === 'network' ? (
                            <NetworkBar
                                network={NETWORK}
                                dayType={dayType}
                                clock={clock}
                                playback={networkPlayback}
                                speed={networkSpeed}
                                onSpeedChange={setNetworkSpeed}
                                onNow={resetToNow}
                                language={language}
                            />
                        ) : (
                            journey && (
                                <PlaybackBar
                                    stations={STATIONS}
                                    journey={journey}
                                    playback={playback}
                                    speed={speed}
                                    onSpeedChange={setSpeed}
                                    language={language}
                                />
                            )
                        )}

                        {view === 'journey' && journey && (
                            <LiveTrains
                                network={NETWORK}
                                stations={STATIONS}
                                journey={journey}
                                dayType={dayType}
                                now={now}
                                language={language}
                            />
                        )}

                        <details className="text-muted mt-6 text-xs leading-relaxed">
                            <summary className="cursor-pointer">
                                {t('metro.sources', {
                                    n: LINES.length.toLocaleString(language),
                                })}
                            </summary>
                            <ul className="m-0 mt-2 list-none p-0">
                                {LINES.map((l) => (
                                    <li key={l.id}>
                                        {l.name[language]}:{' '}
                                        <bdi dir="ltr">{l.source.file}</bdi>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2">{t('metro.sourceNote')}</p>
                        </details>
                    </motion.section>
                </div>
            </SubPageShell>
        </MotionConfig>
    );
};
