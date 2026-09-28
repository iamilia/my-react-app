import {
    IconAlertTriangle,
    IconCalendarTime,
    IconInfoCircle,
    IconWalk,
} from '@tabler/icons-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { Language } from '../types/lang';
import { localiseNumber } from '../utils/number';
import type {
    Journey,
    LineData,
    MetroError,
    NetworkStation,
    Result,
} from './core';
import { errorMessage, formatMinutes, stationNamer } from './messages';

interface JourneyCardProps {
    lines: readonly LineData[];
    stations: NetworkStation[];
    /** Best first. */
    journeys: Result<Journey[]>;
    selected: number;
    onSelect: (index: number) => void;
    language: Language;
}

const LineBadge = ({
    line,
    language,
}: {
    line: LineData;
    language: Language;
}) => (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold">
        <span
            className="inline-block size-2.5 rounded-full"
            style={{ background: line.color }}
            aria-hidden
        />
        {line.name[language]}
    </span>
);

const Figure = ({
    label,
    value,
    unit,
    hint,
}: {
    label: string;
    value: string;
    unit?: string;
    hint?: string;
}) => (
    <div className="min-w-0">
        <dt className="label">{label}</dt>
        <dd className="m-0 mt-1.5">
            <span className="nums text-xl font-semibold">{value}</span>
            {unit && <span className="text-muted text-sm"> {unit}</span>}
            {hint && <p className="text-muted mt-1 text-xs">{hint}</p>}
        </dd>
    </div>
);

const ErrorNote = ({ message }: { message: string }) => (
    <p className="mt-4 flex items-start gap-2 rounded-xl border border-(--line) bg-(--tint) p-3 text-sm">
        <IconAlertTriangle
            size={16}
            aria-hidden
            className="text-accent mt-0.5 shrink-0"
        />
        <span>{message}</span>
    </p>
);

export const JourneyCard = ({
    lines,
    stations,
    journeys,
    selected,
    onSelect,
    language,
}: JourneyCardProps) => {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();
    const name = stationNamer(stations, language);
    const message = (error: MetroError) =>
        errorMessage(error, t, name, language);
    const lineOf = (id: string) => lines.find((l) => l.id === id);
    const min = (seconds: number) => formatMinutes(seconds, language);
    const n = (value: number) => localiseNumber(value, language);

    const journey = journeys.ok
        ? (journeys.value[selected] ?? journeys.value[0])
        : null;

    // One key per distinct answer, so the figures cross-fade when it changes.
    const key = journey
        ? `${journey.legs.map((l) => `${l.lineId}:${l.plan.stationIds.join('>')}`).join('|')}|${journey.knownSeconds}`
        : `error:${journeys.ok ? '' : journeys.error.code}`;

    const fade = reduceMotion
        ? { initial: false as const }
        : {
              initial: { opacity: 0, y: 8, filter: 'blur(6px)' },
              animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
              exit: { opacity: 0, y: -6, filter: 'blur(4px)' },
              transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
          };

    const stops = journey
        ? journey.legs.reduce((s, l) => s + l.plan.stationIds.length - 1, 0)
        : 0;
    const unknownWalks = journey
        ? journey.transfers.filter((x) => x.walkSeconds === null).length
        : 0;

    return (
        <section
            className="card"
            aria-live="polite"
            aria-label={t('metro.result.label')}
        >
            <span className="tag self-start">
                <IconInfoCircle size={13} aria-hidden />
                {t('metro.estimateBadge')}
            </span>

            <AnimatePresence mode="wait" initial={false}>
                <motion.div key={key} {...fade}>
                    {journey ? (
                        <>
                            <div className="mt-5 flex items-end gap-3">
                                <span className="display nums text-[clamp(3.25rem,12vw,4.5rem)] leading-none text-(--accent)">
                                    {min(journey.rideSeconds)}
                                </span>
                                <span className="pb-2">
                                    <span className="block text-base font-semibold">
                                        {t('metro.result.minutes')}
                                    </span>
                                    <span className="label">
                                        {t('metro.result.ride')}
                                    </span>
                                </span>
                            </div>

                            <p className="text-muted mt-3 text-sm">
                                {t('metro.result.stops', {
                                    count: stops,
                                    n: n(stops),
                                })}
                                {t('metro.sep')}
                                {journey.transfers.length === 0
                                    ? t('metro.result.direct')
                                    : t('metro.result.changes', {
                                          count: journey.transfers.length,
                                          n: n(journey.transfers.length),
                                      })}
                            </p>

                            <hr className="rule mt-5" />

                            <dl className="m-0 mt-4 grid grid-cols-2 gap-4">
                                <Figure
                                    label={t('metro.result.wait')}
                                    value={
                                        journey.waitSeconds === null
                                            ? '—'
                                            : min(journey.waitSeconds)
                                    }
                                    unit={
                                        journey.waitSeconds === null
                                            ? undefined
                                            : t('metro.result.minutes')
                                    }
                                    hint={t('metro.result.waitHint')}
                                />
                                <Figure
                                    label={t('metro.result.total')}
                                    value={
                                        journey.totalSeconds === null
                                            ? `≥ ${min(journey.knownSeconds)}`
                                            : min(journey.totalSeconds)
                                    }
                                    unit={t('metro.result.minutes')}
                                    hint={
                                        journey.totalSeconds === null &&
                                        unknownWalks > 0
                                            ? t(
                                                  'metro.result.totalWithoutWalk',
                                                  {
                                                      count: unknownWalks,
                                                      n: n(unknownWalks),
                                                  }
                                              )
                                            : t('metro.result.totalHint')
                                    }
                                />
                            </dl>

                            {/* --- legs ------------------------------------- */}
                            <ol className="m-0 mt-5 flex list-none flex-col gap-0 p-0">
                                {journey.legs.map((leg, i) => {
                                    const line = lineOf(leg.lineId);
                                    const transfer = journey.transfers[i];
                                    const ids = leg.plan.stationIds;
                                    return (
                                        <li key={`${leg.lineId}-${ids[0]}`}>
                                            <div
                                                className="border-s-4 py-2 ps-3"
                                                style={{
                                                    borderColor:
                                                        line?.color ??
                                                        'var(--line)',
                                                }}
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    {line && (
                                                        <LineBadge
                                                            line={line}
                                                            language={language}
                                                        />
                                                    )}
                                                    <span className="nums text-muted text-xs">
                                                        {t(
                                                            'metro.result.legTime',
                                                            {
                                                                ride: min(
                                                                    leg.plan
                                                                        .totalSeconds
                                                                ),
                                                                n: n(
                                                                    ids.length -
                                                                        1
                                                                ),
                                                                count:
                                                                    ids.length -
                                                                    1,
                                                            }
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="m-0 mt-1 text-sm font-semibold">
                                                    {name(ids[0])}
                                                    <span className="text-muted">
                                                        {' → '}
                                                    </span>
                                                    {name(ids[ids.length - 1])}
                                                </p>
                                                <p className="text-muted m-0 mt-0.5 text-xs">
                                                    {t('metro.result.towards', {
                                                        station: name(
                                                            line?.directions[
                                                                leg.plan
                                                                    .direction
                                                            ].towards ?? ''
                                                        ),
                                                    })}
                                                    {t('metro.sep')}
                                                    {leg.wait.ok
                                                        ? t(
                                                              'metro.result.legWait',
                                                              {
                                                                  wait: min(
                                                                      leg.wait
                                                                          .value
                                                                          .waitSeconds
                                                                  ),
                                                                  headway: min(
                                                                      leg.wait
                                                                          .value
                                                                          .headwaySeconds
                                                                  ),
                                                              }
                                                          )
                                                        : message(
                                                              leg.wait.error
                                                          )}
                                                </p>
                                            </div>
                                            {transfer && (
                                                <p className="text-muted m-0 flex items-center gap-2 py-2 ps-1 text-xs">
                                                    <IconWalk
                                                        size={14}
                                                        aria-hidden
                                                        className="shrink-0"
                                                    />
                                                    {transfer.walkSeconds ===
                                                    null
                                                        ? t(
                                                              'metro.result.changeUnknown',
                                                              {
                                                                  station: name(
                                                                      transfer.stationId
                                                                  ),
                                                              }
                                                          )
                                                        : t(
                                                              'metro.result.changeKnown',
                                                              {
                                                                  station: name(
                                                                      transfer.stationId
                                                                  ),
                                                                  walk: min(
                                                                      transfer.walkSeconds
                                                                  ),
                                                              }
                                                          )}
                                                </p>
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>

                            {/* --- alternatives ----------------------------- */}
                            {journeys.ok && journeys.value.length > 1 && (
                                <fieldset className="m-0 mt-4 border-0 p-0">
                                    <legend className="label">
                                        {t('metro.result.routes')}
                                    </legend>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {journeys.value.map((option, i) => (
                                            <button
                                                key={option.legs
                                                    .map((l) => l.lineId)
                                                    .join('-')}
                                                type="button"
                                                onClick={() => onSelect(i)}
                                                aria-pressed={
                                                    option === journey
                                                }
                                                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                                    option === journey
                                                        ? 'border-(--accent) bg-(--accent-soft) text-(--accent)'
                                                        : 'text-muted border-(--line) hover:text-(--fg)'
                                                }`}
                                            >
                                                <span
                                                    className="flex gap-0.5"
                                                    aria-hidden
                                                >
                                                    {option.legs.map((l) => (
                                                        <span
                                                            key={`${l.lineId}-${l.plan.stationIds[0]}`}
                                                            className="inline-block size-2 rounded-full"
                                                            style={{
                                                                background:
                                                                    lineOf(
                                                                        l.lineId
                                                                    )?.color,
                                                            }}
                                                        />
                                                    ))}
                                                </span>
                                                {t('metro.result.routeOption', {
                                                    ride: min(
                                                        option.rideSeconds
                                                    ),
                                                    count: option.transfers
                                                        .length,
                                                    n: n(
                                                        option.transfers.length
                                                    ),
                                                })}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-muted mt-2 text-xs">
                                        {t('metro.result.routesHint')}
                                    </p>
                                </fieldset>
                            )}
                        </>
                    ) : (
                        !journeys.ok && (
                            <ErrorNote message={message(journeys.error)} />
                        )
                    )}
                </motion.div>
            </AnimatePresence>

            <p className="text-muted mt-5 flex items-start gap-2 text-xs leading-relaxed">
                <IconCalendarTime
                    size={14}
                    aria-hidden
                    className="mt-0.5 shrink-0"
                />
                <span>{t('metro.disclaimer')}</span>
            </p>
        </section>
    );
};
