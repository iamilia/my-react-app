/**
 * The 1984 pointer and pointing hand, drawn from pixel grids (B ink,
 * W paper) and handed to style.css as custom properties. Black with a
 * white rim, so they read on both the light and the inverted screen.
 */
const ARROW = [
    'W..........',
    'WW.........',
    'WBW........',
    'WBBW.......',
    'WBBBW......',
    'WBBBBW.....',
    'WBBBBBW....',
    'WBBBBBBW...',
    'WBBBBBBBW..',
    'WBBBBBBBBW.',
    'WBBBBBWWWWW',
    'WBBWBBW....',
    'WBW.WBBW...',
    'WW..WBBW...',
    'W....WBBW..',
    '.....WBBW..',
    '......WW...',
];

const HAND = [
    '.....BB.........',
    '....BWWB........',
    '....BWWB........',
    '....BWWB........',
    '....BWWBBB......',
    '....BWWBWWBBB...',
    '.BB.BWWBWWBWWBB.',
    'BWWBBWWBWWBWWBWB',
    'BWWWBWWWWWWWWWWB',
    '.BWWWWWWWWWWWWWB',
    '..BWWWWWWWWWWWWB',
    '..BWWWWWWWWWWWB.',
    '...BWWWWWWWWWWB.',
    '...BWWWWWWWWWB..',
    '....BWWWWWWWWB..',
    '....BBBBBBBBBB..',
];

const toCursor = (grid: string[], hx: number, hy: number, fallback: string) => {
    const rects = grid.flatMap((row, y) =>
        [...row].flatMap((c, x) =>
            c === '.'
                ? []
                : `<rect x="${x}" y="${y}" width="1" height="1" fill="${c === 'B' ? '#000' : '#fff'}"/>`
        )
    );
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${grid[0].length}" height="${grid.length}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hx} ${hy}, ${fallback}`;
};

const root = document.documentElement.style;
root.setProperty('--cursor-arrow', toCursor(ARROW, 0, 0, 'default'));
root.setProperty('--cursor-hand', toCursor(HAND, 5, 0, 'pointer'));
