import {
    animate,
    motion,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from 'motion/react';
import { type RefObject, useCallback, useEffect, useState } from 'react';
import { EASE_OUT } from './Motion';

interface Geometry {
    d: string;
    /** Total path length in px. */
    total: number;
    /** Length of the horizontal run + bend, drawn on load. */
    intro: number;
    /** y (in <main> coordinates) where the vertical run starts. */
    turnY: number;
    start: { x: number; y: number };
    rail: number;
    endY: number;
    stations: { x: number; y: number; at: number }[];
}

const BEND = 28;
/** The line's head sits this far down the viewport. */
const HEAD = 0.62;

/**
 * The transit line the home page runs on. It starts under the hero at
 * `[data-route-start]`, runs to the rail, turns down, and stops at every
 * `[data-station]` until the last one, which is the terminus.
 *
 * Everything is measured off the DOM, so it follows the layout at every
 * width and mirrors itself in RTL (the start is then left of the rail).
 */
export const RouteLine = ({
    container,
}: {
    container: RefObject<HTMLElement | null>;
}) => {
    const [geo, setGeo] = useState<Geometry | null>(null);
    const [reached, setReached] = useState(-1);
    const reduce = useReducedMotion();

    const measure = useCallback(() => {
        const root = container.current;
        if (!root) return;
        const box = root.getBoundingClientRect();
        const startEl = root.querySelector('[data-route-start]');
        const stationEls = [...root.querySelectorAll('[data-station]')];
        if (!startEl || stationEls.length === 0) return;

        const centre = (el: Element) => {
            const r = el.getBoundingClientRect();
            return {
                x: r.left + r.width / 2 - box.left,
                y: r.top + r.height / 2 - box.top,
            };
        };

        const start = centre(startEl);
        const points = stationEls.map(centre);
        const rail = points[0].x;
        const endY = points[points.length - 1].y;
        const dir = start.x > rail ? 1 : -1;
        const turnY = start.y + BEND;

        const d = [
            `M ${start.x} ${start.y}`,
            `H ${rail + dir * BEND}`,
            `Q ${rail} ${start.y} ${rail} ${turnY}`,
            `V ${endY}`,
        ].join(' ');

        // A quarter bend drawn as a quadratic is ~1.1x its radius.
        const intro = Math.abs(start.x - rail) - BEND + BEND * 1.1;
        const total = intro + (endY - turnY);

        setGeo({
            d,
            total,
            intro,
            turnY,
            start,
            rail,
            endY,
            stations: points.map((p) => ({
                ...p,
                at: intro + (p.y - turnY),
            })),
        });
    }, [container]);

    // useEffect, not useLayoutEffect: a child's layout effect runs before
    // the parent's ref to <main> is attached.
    useEffect(() => {
        measure();
        const root = container.current;
        if (!root) return;
        const ro = new ResizeObserver(measure);
        ro.observe(root);
        // Fonts change every line height once they land.
        void document.fonts?.ready.then(measure);
        return () => ro.disconnect();
    }, [container, measure]);

    // ---------------------------------------------------------- drawing
    const { scrollY } = useScroll();
    const introDone = useMotionValue(reduce ? 1 : 0);
    const ready = geo !== null;

    useEffect(() => {
        if (reduce || !ready) return;
        const c = animate(introDone, 1, {
            duration: 1.4,
            delay: 0.9,
            ease: EASE_OUT,
        });
        return () => c.stop();
    }, [reduce, ready, introDone]);

    /** How many px of the path the scroll position has earned. */
    const earned = useTransform(() => {
        if (!geo) return 0;
        if (reduce) return geo.total;
        const root = container.current;
        const top = root
            ? root.getBoundingClientRect().top + window.scrollY
            : 0;
        const head = scrollY.get() + window.innerHeight * HEAD - top;
        const down = Math.min(
            Math.max(head - geo.turnY, 0),
            geo.endY - geo.turnY
        );
        return geo.intro * introDone.get() + (introDone.get() >= 1 ? down : 0);
    });

    const smooth = useSpring(earned, { stiffness: 140, damping: 30 });
    const pathLength = useTransform(() =>
        geo ? Math.min(smooth.get() / geo.total, 1) : 0
    );

    useMotionValueEvent(smooth, 'change', (px) => {
        if (!geo) return;
        let i = -1;
        geo.stations.forEach((s, k) => {
            if (px >= s.at - 1) i = k;
        });
        setReached((prev) => (prev === i ? prev : i));
    });

    if (!geo) return null;

    const last = geo.stations.length - 1;

    return (
        <svg className="route-svg" aria-hidden="true">
            <path className="route-track" d={geo.d} />
            <motion.path
                className="route-path"
                d={geo.d}
                style={{ pathLength }}
            />

            {/* Origin: a ring where the line begins under the name. */}
            <motion.circle
                className="station-dot is-reached"
                cx={geo.start.x}
                cy={geo.start.y}
                r={7}
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
                style={{ transformOrigin: `${geo.start.x}px ${geo.start.y}px` }}
            />

            {geo.stations.map((s, i) => {
                const isReached = i <= reached;
                if (i === last) {
                    // Terminus: a bar across the line, the way metro maps end one.
                    return (
                        <motion.line
                            key="terminus"
                            className="terminus"
                            x1={s.x - 14}
                            x2={s.x + 14}
                            y1={s.y}
                            y2={s.y}
                            initial={false}
                            animate={{
                                opacity: isReached ? 1 : 0.25,
                                scaleX: isReached ? 1 : 0.5,
                            }}
                            style={{ transformOrigin: `${s.x}px ${s.y}px` }}
                            transition={{
                                type: 'spring',
                                stiffness: 260,
                                damping: 18,
                            }}
                        />
                    );
                }
                return (
                    <motion.circle
                        key={s.y}
                        className={`station-dot ${isReached ? 'is-reached' : ''} ${
                            i === reached ? 'is-here' : ''
                        }`}
                        cx={s.x}
                        cy={s.y}
                        r={7}
                        initial={false}
                        animate={{ scale: i === reached ? 1.35 : 1 }}
                        style={{ transformOrigin: `${s.x}px ${s.y}px` }}
                        transition={{
                            type: 'spring',
                            stiffness: 320,
                            damping: 16,
                        }}
                    />
                );
            })}
        </svg>
    );
};
