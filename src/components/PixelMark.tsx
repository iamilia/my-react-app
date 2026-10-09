import { useEffect, useRef, useState } from 'react';

/**
 * The site's glyph — a 9×9 happy face, drawn on the pixel grid so it stays
 * crisp at any multiple. It sits where the Apple logo sat on the original
 * menu bar, and in the hero at poster size. Inherits `currentColor`, so it
 * inverts along with whatever it is inside.
 *
 * It is alive: the eyes are drawn separately and shift a pixel toward the
 * pointer, and every few seconds it blinks.
 */
const PIXELS = [
    '..#####..',
    '.#.....#.',
    '#.......#',
    '#.......#',
    '#.......#',
    '#.#...#.#',
    '#..###..#',
    '.#.....#.',
    '..#####..',
];

const RECTS = PIXELS.flatMap((row, y) =>
    [...row].flatMap((cell, x) => (cell === '#' ? [{ x, y }] : []))
);

const reducedMotion = () =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export const PixelMark = ({
    size = 18,
    className = '',
}: {
    size?: number;
    className?: string;
}) => {
    const ref = useRef<SVGSVGElement>(null);
    // "dx,dy" as one string, so React skips the render when it hasn't moved
    const [look, setLook] = useState('0,0');
    const [blink, setBlink] = useState(false);

    useEffect(() => {
        let frame = 0;
        const onMove = (e: PointerEvent) => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                const box = ref.current?.getBoundingClientRect();
                if (!box) return;
                const vx = e.clientX - (box.left + box.width / 2);
                const vy = e.clientY - (box.top + box.height / 2);
                const d = Math.hypot(vx, vy);
                // Close enough and it looks straight back at you.
                const step = (v: number) =>
                    d > box.width && Math.abs(v) > d * 0.38 ? Math.sign(v) : 0;
                setLook(`${step(vx)},${step(vy)}`);
            });
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('pointermove', onMove);
        };
    }, []);

    useEffect(() => {
        if (reducedMotion()) return;
        let timer: ReturnType<typeof setTimeout>;
        const next = () => {
            timer = setTimeout(
                () => {
                    setBlink(true);
                    timer = setTimeout(() => {
                        setBlink(false);
                        next();
                    }, 140);
                },
                2200 + Math.random() * 3800
            );
        };
        next();
        return () => clearTimeout(timer);
    }, []);

    const [dx, dy] = look.split(',').map(Number);

    return (
        <svg
            ref={ref}
            width={size}
            height={size}
            viewBox="0 0 9 9"
            shapeRendering="crispEdges"
            fill="currentColor"
            aria-hidden="true"
            className={`shrink-0 ${className}`}
        >
            {RECTS.map(({ x, y }) => (
                <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
            ))}
            {blink ? (
                <rect x={3 + dx} y={3 + dy} width="3" height="1" />
            ) : (
                <>
                    <rect x={3 + dx} y={3 + dy} width="1" height="1" />
                    <rect x={5 + dx} y={3 + dy} width="1" height="1" />
                </>
            )}
        </svg>
    );
};
