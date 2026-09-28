import {
    IconPlayerPauseFilled,
    IconPlayerPlayFilled,
    IconRotateClockwise,
} from '@tabler/icons-react';
import { useMotionValueEvent } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language } from '../types/lang';
import { localiseNumber } from '../utils/number';
import { type Journey, journeyPositionAt, type NetworkStation } from './core';
import { stationNamer } from './messages';
import { SELECT_OPTION, SELECT_SMALL } from './styles';
import { type RidePlayback, SPEEDS, type Speed } from './useRidePlayback';

interface PlaybackBarProps {
    stations: NetworkStation[];
    journey: Journey;
    playback: RidePlayback;
    speed: Speed;
    onSpeedChange: (speed: Speed) => void;
    language: Language;
}

const mmss = (seconds: number, language: Language) => {
    const whole = Math.floor(seconds);
    const m = localiseNumber(Math.floor(whole / 60), language, 'padded');
    const s = localiseNumber(whole % 60, language, 'padded');
    return `${m}:${s}`;
};

/**
 * Transport controls for the ride. The clock and the slider are written
 * straight to the DOM from the motion value — re-rendering React 60 times a
 * second to move a thumb would be the expensive way to do the same thing.
 */
export const PlaybackBar = ({
    stations,
    journey,
    playback,
    speed,
    onSpeedChange,
    language,
}: PlaybackBarProps) => {
    const { t } = useTranslation();
    const { elapsed, playing, play, pause, restart, seek } = playback;
    const clockRef = useRef<HTMLSpanElement>(null);
    const sliderRef = useRef<HTMLInputElement>(null);
    const speedId = useId();
    // Id of the next stop, or null once arrived.
    const first = journey.legs[0].plan.stationIds;
    const [nextStop, setNextStop] = useState<string | null>(first[1] ?? null);

    // Ride time only — waits and walks are on the card, not in the replay.
    const total = journey.rideSeconds;
    const name = stationNamer(stations, language);

    const paint = (value: number) => {
        if (clockRef.current) {
            clockRef.current.textContent = mmss(value, language);
        }
        if (sliderRef.current) sliderRef.current.value = String(value);
        const at = journeyPositionAt(journey, value);
        const ids = journey.legs[at.legIndex].plan.stationIds;
        setNextStop(
            at.progress >= 1 ? null : (ids[at.position.leg + 1] ?? null)
        );
    };

    useMotionValueEvent(elapsed, 'change', paint);
    // Repaint when the ride or the language changes while paused.
    // biome-ignore lint/correctness/useExhaustiveDependencies: paint is recreated each render; journey/language are the real inputs
    useEffect(() => paint(elapsed.get()), [journey, language, elapsed]);

    const finished = nextStop === null;
    const shown = nextStop ?? journey.toId;

    return (
        <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={playing ? pause : play}
                    className="btn min-h-10! px-4!"
                    aria-label={
                        playing
                            ? t('metro.playback.pause')
                            : t('metro.playback.play')
                    }
                >
                    {playing ? (
                        <IconPlayerPauseFilled size={16} aria-hidden />
                    ) : (
                        <IconPlayerPlayFilled
                            size={16}
                            aria-hidden
                            className="rtl:-scale-x-100"
                        />
                    )}
                </button>
                <button
                    type="button"
                    onClick={restart}
                    className="btn-outline min-h-10! px-4!"
                    aria-label={t('metro.playback.restart')}
                >
                    <IconRotateClockwise size={16} aria-hidden />
                </button>

                <span className="nums font-mono text-sm" dir="ltr">
                    <span ref={clockRef}>{mmss(0, language)}</span>
                    <span className="text-muted">
                        {' '}
                        / {mmss(total, language)}
                    </span>
                </span>

                <label
                    htmlFor={speedId}
                    className="ms-auto flex items-center gap-2"
                >
                    <span className="label">{t('metro.playback.speed')}</span>
                    <select
                        id={speedId}
                        value={speed}
                        onChange={(e) =>
                            onSpeedChange(Number(e.target.value) as Speed)
                        }
                        className={SELECT_SMALL}
                    >
                        {SPEEDS.map((s) => (
                            <option key={s} value={s} className={SELECT_OPTION}>
                                {s === 1
                                    ? t('metro.playback.realtime')
                                    : t('metro.playback.times', {
                                          x: localiseNumber(s, language),
                                      })}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <input
                ref={sliderRef}
                type="range"
                min={0}
                max={total}
                step={1}
                defaultValue={0}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label={t('metro.playback.scrub')}
                aria-valuetext={t(
                    finished
                        ? 'metro.playback.arrived'
                        : 'metro.playback.nextStation',
                    { station: name(shown) }
                )}
                className="w-full cursor-pointer accent-(--accent)"
                // Time runs origin → destination; keep the thumb moving the
                // same way as the reading direction of the page.
                dir={language === 'fa' ? 'rtl' : 'ltr'}
            />

            <p className="text-muted text-xs">
                {t(
                    finished
                        ? 'metro.playback.arrived'
                        : 'metro.playback.nextStation',
                    { station: name(shown) }
                )}
            </p>
        </div>
    );
};
