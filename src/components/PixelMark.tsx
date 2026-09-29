/**
 * The site's glyph in the menu bar — a 9×9 happy face, drawn on the pixel
 * grid so it stays crisp at any multiple. It sits where the Apple logo sat
 * on the original menu bar. Inherits `currentColor`, so it inverts along
 * with whatever it is inside.
 */
const PIXELS = [
    '..#####..',
    '.#.....#.',
    '#.......#',
    '#..#.#..#',
    '#.......#',
    '#.#...#.#',
    '#..###..#',
    '.#.....#.',
    '..#####..',
];

const RECTS = PIXELS.flatMap((row, y) =>
    [...row].flatMap((cell, x) => (cell === '#' ? [{ x, y }] : []))
);

export const PixelMark = ({ size = 18 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 9 9"
        shapeRendering="crispEdges"
        fill="currentColor"
        aria-hidden="true"
        className="shrink-0"
    >
        {RECTS.map(({ x, y }) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
        ))}
    </svg>
);
