import { IconTrain } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Language } from '../types/lang';
import { localiseNumber } from '../utils/number';
import {
    type ApproachingTrain,
    approachingTrains,
    type DayType,
    type Journey,
    type NetworkData,
    type NetworkStation,
} from './core';
import { formatClockLocalised, formatMinutes, stationNamer } from './messages';

interface LiveTrainsProps {
    network: NetworkData;
    stations: NetworkStation[];
    journey: Journey;
    dayType: DayType;
    /** Seconds since midnight, ticking. */
    now: number;
    language: Language;
}

const hhmmss = (seconds: number, language: Language) => {
    const s = Math.floor(seconds) % 86_400;
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
        .map((n) => localiseNumber(n, language, 'padded'))
        .join(':');
};

/**
 * "Where is my train?" — for each train the journey boards, the next few
 * that will call at that platform, where the timetable puts them right now
 * and how long until they arrive. Later legs are looked at for when the
 * rider gets to that platform.
 */
export const LiveTrains = ({
    network,
    stations,
    journey,
    dayType,
    now,
    language,
}: LiveTrainsProps) => {
    const { t } = useTranslation();
    const name = stationNamer(stations, language);
    const n = (value: number) => localiseNumber(value, language);
    const firstPlatform = journey.legs[0].platformAt;

    const describe = (train: ApproachingTrain) => {
        switch (train.where.kind) {
            case 'at':
                return t('metro.live.at', {
                    station: name(train.where.stationId),
                });
            case 'between':
                return t('metro.live.between', {
                    a: name(train.where.fromId),
                    b: name(train.where.toId),
                });
            case 'waiting':
                return t('metro.live.waiting', {
                    station: name(train.where.stationId),
                    time: formatClockLocalised(train.where.departsAt, language),
                });
        }
    };

    return (
        <section className="card mt-6" aria-label={t('metro.live.title')}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="m-0 flex items-center gap-2 text-base font-semibold">
                    <IconTrain size={18} aria-hidden className="text-accent" />
                    {t('metro.live.title')}
                </h2>
                <span className="text-muted text-xs">
                    {t('metro.live.clock')}{' '}
                    <span className="nums font-mono" dir="ltr">
                        {hhmmss(now, language)}
                    </span>
                </span>
            </div>

            <div className="mt-4 flex flex-col gap-5">
                {journey.legs.map((leg, i) => {
                    const line = network.lines.find((l) => l.id === leg.lineId);
                    const ids = leg.plan.stationIds;
                    // Later legs: look when the rider gets to that platform.
                    const at = now + (leg.platformAt - firstPlatform);
                    const trains = approachingTrains(
                        network,
                        leg.lineId,
                        ids[0],
                        ids[ids.length - 1],
                        dayType,
                        at
                    );
                    return (
                        <div key={`${leg.lineId}-${ids[0]}`}>
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
                                    {t('metro.live.platform', {
                                        station: name(ids[0]),
                                        towards: name(
                                            line?.directions[leg.plan.direction]
                                                .towards ?? ''
                                        ),
                                    })}
                                </span>
                            </p>
                            {i > 0 && (
                                <p className="text-muted m-0 mt-0.5 text-xs">
                                    {t('metro.live.later', {
                                        time: formatClockLocalised(
                                            at,
                                            language
                                        ),
                                    })}
                                </p>
                            )}

                            {trains.length === 0 ? (
                                <p className="text-muted m-0 mt-2 text-xs">
                                    {t('metro.live.none')}
                                </p>
                            ) : (
                                <ol className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
                                    {trains.map((train, k) => (
                                        <li
                                            key={train.key}
                                            className="flex items-start justify-between gap-3 rounded-lg border border-(--line) px-3 py-2 text-xs"
                                        >
                                            <span className="min-w-0">
                                                <span className="nums text-muted me-1.5">
                                                    {n(k + 1)}.
                                                </span>
                                                {describe(train)}
                                                {train.stopsAway > 0 && (
                                                    <span className="text-muted">
                                                        {t('metro.sep')}
                                                        {t(
                                                            'metro.live.stopsAway',
                                                            {
                                                                count: train.stopsAway,
                                                                n: n(
                                                                    train.stopsAway
                                                                ),
                                                            }
                                                        )}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="nums shrink-0 font-semibold text-(--accent)">
                                                {train.etaSeconds < 30
                                                    ? t('metro.live.now')
                                                    : t('metro.live.eta', {
                                                          min: formatMinutes(
                                                              Math.round(
                                                                  train.etaSeconds /
                                                                      60
                                                              ) * 60,
                                                              language
                                                          ),
                                                      })}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="text-muted mt-4 mb-0 text-xs">
                {t('metro.live.note')}
            </p>
        </section>
    );
};
