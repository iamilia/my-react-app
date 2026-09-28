import {
    type AnimationPlaybackControls,
    animate,
    type MotionValue,
    useMotionValue,
} from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Playback speeds, as "ride seconds per real second". 60 means one real
 * second shows one minute of the ride; 1 is real time.
 */
export const SPEEDS = [1, 30, 60, 120] as const;
export type Speed = (typeof SPEEDS)[number];
export const DEFAULT_SPEED: Speed = 60;

export interface RidePlayback {
    /** Seconds into the ride, 0 → `totalSeconds`. Scenes read this per frame. */
    elapsed: MotionValue<number>;
    playing: boolean;
    play: () => void;
    pause: () => void;
    restart: () => void;
    /** Jump to a ride second (pauses). */
    seek: (seconds: number) => void;
}

/**
 * One clock for one ride. `totalSeconds` comes from `planRide()`, so the
 * animation can only ever last as long as the ride the card is showing —
 * scaled by `speed`, never re-timed.
 *
 * `rideKey` identifies the ride; a new key rewinds to 0.
 */
export const useRidePlayback = (
    rideKey: string,
    totalSeconds: number,
    speed: Speed,
    autoplay: boolean
): RidePlayback => {
    const elapsed = useMotionValue(0);
    const controls = useRef<AnimationPlaybackControls | null>(null);
    const [playing, setPlaying] = useState(false);

    const stop = useCallback(() => {
        controls.current?.stop();
        controls.current = null;
    }, []);

    const runFrom = useCallback(
        (from: number) => {
            stop();
            if (totalSeconds <= 0) return;
            const start = from >= totalSeconds ? 0 : from;
            elapsed.set(start);
            setPlaying(true);
            controls.current = animate(elapsed, totalSeconds, {
                duration: (totalSeconds - start) / speed,
                ease: 'linear',
                onComplete: () => {
                    controls.current = null;
                    setPlaying(false);
                },
            });
        },
        [elapsed, speed, stop, totalSeconds]
    );

    // New ride → rewind (and start, unless the visitor prefers no motion).
    // biome-ignore lint/correctness/useExhaustiveDependencies: rideKey is the trigger; runFrom changes with speed, which must not rewind
    useEffect(() => {
        stop();
        elapsed.set(0);
        setPlaying(false);
        if (autoplay) runFrom(0);
        return stop;
    }, [rideKey, totalSeconds, autoplay]);

    // Speed change mid-ride → carry on from the same second at the new rate.
    const speedRef = useRef(speed);
    useEffect(() => {
        if (speedRef.current === speed) return;
        speedRef.current = speed;
        if (controls.current) runFrom(elapsed.get());
    }, [speed, runFrom, elapsed]);

    const pause = useCallback(() => {
        stop();
        setPlaying(false);
    }, [stop]);

    return {
        elapsed,
        playing,
        play: useCallback(() => runFrom(elapsed.get()), [runFrom, elapsed]),
        pause,
        restart: useCallback(() => runFrom(0), [runFrom]),
        seek: useCallback(
            (seconds: number) => {
                pause();
                elapsed.set(Math.min(Math.max(seconds, 0), totalSeconds));
            },
            [pause, elapsed, totalSeconds]
        ),
    };
};
