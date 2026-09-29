import { IconClockHour4 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Language } from '../types/lang';
import type {
    ApproachingTrain,
    Direction,
    LineData,
    NetworkStation,
    StationPlatform,
} from './core';
import { formatClockLocalised, formatMinutes, stationNamer } from './messages';

interface StationBoardProps {
    lines: readonly LineData[];
    stations: NetworkStation[];
    stationId: string;
    board: StationPlatform[];
    /** The platform the chosen ride boards at, highlighted. */
    boarding: { lineId: string; direction: Direction } | null;
    language: Language;
}

/**
 * "When does the train come?" — the departure board of the From station:
 * every line and direction that leaves it, and when the next trains are
 * due there by the timetable.
 */
export const StationBoard = ({
    lines,
    stations,
    stationId,
    board,
    boarding,
    language,
}: StationBoardProps) => {
    const { t } = useTranslation();
    const name = stationNamer(stations, language);

    const eta = (train: ApproachingTrain) =>
        train.etaSeconds < 30
            ? t('metro.live.now')
            : t('metro.live.eta', {
                  min: formatMinutes(
                      Math.round(train.etaSeconds / 60) * 60,
                      language
                  ),
              });

    return (
        <section className="card" aria-label={t('metro.board.label')}>
            <h2 className="m-0 flex items-center gap-2 text-base font-semibold">
                <IconClockHour4 size={18} aria-hidden className="text-accent" />
                {t('metro.board.title', { station: name(stationId) })}
            </h2>

            <div className="mt-4 flex flex-col gap-4">
                {board.map((platform) => {
                    const line = lines.find((l) => l.id === platform.lineId);
                    const yours =
                        boarding?.lineId === platform.lineId &&
                        boarding.direction === platform.direction;
                    return (
                        <div key={`${platform.lineId}-${platform.direction}`}>
                            <p className="m-0 flex flex-wrap items-center gap-x-2 text-sm">
                                <span
                                    className="inline-block size-2.5 shrink-0 rounded-full"
                                    style={{ background: line?.color }}
                                    aria-hidden
                                />
                                <span className="font-semibold">
                                    {line?.name[language]}
                                </span>
                                <span className="text-muted">
                                    {t('metro.board.towards', {
                                        station: name(platform.towards),
                                    })}
                                </span>
                                {yours && (
                                    <span className="rounded-full bg-(--accent-soft) px-2 py-0.5 text-[0.6875rem] font-semibold text-(--accent)">
                                        {t('metro.board.yours')}
                                    </span>
                                )}
                            </p>

                            {platform.trains.length === 0 ? (
                                <p className="text-muted m-0 mt-2 text-xs">
                                    {t('metro.board.none')}
                                </p>
                            ) : (
                                <ol className="m-0 mt-2 grid list-none grid-cols-3 gap-1.5 p-0">
                                    {platform.trains.map((train) => (
                                        <li
                                            key={train.key}
                                            className={`flex min-w-0 flex-col rounded-lg border px-2.5 py-1.5 ${
                                                yours
                                                    ? 'border-(--accent)'
                                                    : 'border-(--line)'
                                            }`}
                                        >
                                            <span
                                                className="nums font-mono text-sm font-semibold"
                                                dir="ltr"
                                            >
                                                {formatClockLocalised(
                                                    train.arrivesAt,
                                                    language
                                                )}
                                            </span>
                                            <span className="nums text-muted truncate text-xs">
                                                {eta(train)}
                                            </span>
                                            {train.terminusId !==
                                                platform.towards && (
                                                <span className="text-muted truncate text-[0.6875rem]">
                                                    {t('metro.board.endsAt', {
                                                        station: name(
                                                            train.terminusId
                                                        ),
                                                    })}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="text-muted mt-4 mb-0 text-xs">
                {t('metro.board.note')}
            </p>
        </section>
    );
};
