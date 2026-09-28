import {
    IconClockPlay,
    IconPlayerPauseFilled,
    IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { type MotionValue, useMotionValueEvent } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language } from '../types/lang';
import { localiseNumber } from '../utils/number';
import { type DayType, type NetworkData, trainsAt } from './core';
import { SELECT_OPTION, SELECT_SMALL } from './styles';
import { type RidePlayback, SPEEDS, type Speed } from './useRidePlayback';

interface NetworkBarProps {
    network: NetworkData;
    dayType: DayType;
    /** Seconds of day shown on the map. */
    clock: MotionValue<number>;
    playback: RidePlayback;
    speed: Speed;
    onSpeedChange: (speed: Speed) => void;
    onNow: () => void;
    language: Language;
}

const hhmmss = (seconds: number, language: Language) => {
    const s = Math.floor(seconds) % 86_400;
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
        .map((n) => localiseNumber(n, language, 'padded'))
        .join(':');
};

/**
 * Controls for the "every train" view: a clock that runs through the day
 * (real time by default), and how many trains the timetables have out at
 * that moment.
 */
export const NetworkBar = ({
    network,
    dayType,
    clock,
    playback,
    speed,
    onSpeedChange,
    onNow,
    language,
}: NetworkBarProps) => {
    const { t } = useTranslation();
    const clockRef = useRef<HTMLSpanElement>(null);
    const speedId = useId();
    const [count, setCount] = useState(0);

    const paint = (value: number) => {
        if (clockRef.current) {
            clockRef.current.textContent = hhmmss(value, language);
        }
        setCount(trainsAt(network, dayType, value).length);
    };
    useMotionValueEvent(clock, 'change', paint);
    // biome-ignore lint/correctness/useExhaustiveDependencies: paint is recreated each render; these are the real inputs
    useEffect(() => paint(clock.get()), [clock, network, dayType, language]);

    return (
        <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={playback.playing ? playback.pause : playback.play}
                    className="btn min-h-10! px-4!"
                    aria-label={
                        playback.playing
                            ? t('metro.network.pause')
                            : t('metro.network.play')
                    }
                >
                    {playback.playing ? (
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
                    onClick={onNow}
                    className="btn-outline min-h-10! px-4!"
                >
                    <IconClockPlay size={16} aria-hidden />
                    {t('metro.form.now')}
                </button>

                <span className="nums font-mono text-sm" dir="ltr">
                    <span ref={clockRef}>{hhmmss(clock.get(), language)}</span>
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

            <p className="text-muted m-0 text-xs">
                {t('metro.network.count', {
                    count,
                    n: localiseNumber(count, language),
                })}
            </p>
            <p className="text-muted m-0 text-xs">{t('metro.network.note')}</p>
        </div>
    );
};
