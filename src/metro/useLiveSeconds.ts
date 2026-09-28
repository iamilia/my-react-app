import { useEffect, useState } from 'react';

/**
 * A wall clock that starts at `start` (seconds since midnight) and ticks
 * once a second in real time. A new `start` restarts it.
 */
export const useLiveSeconds = (start: number) => {
    const [state, setState] = useState({ start, elapsed: 0 });
    const elapsed = state.start === start ? state.elapsed : 0;

    useEffect(() => {
        const t0 = Date.now();
        setState({ start, elapsed: 0 });
        const id = window.setInterval(() => {
            setState({ start, elapsed: Math.floor((Date.now() - t0) / 1000) });
        }, 1000);
        return () => window.clearInterval(id);
    }, [start]);

    return start + elapsed;
};
