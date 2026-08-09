/**
 * Pure 2048 rules — no React, no DOM, no storage.
 *
 * Tiles carry stable ids so the view can animate them: a tile that slides
 * keeps its id and just changes row/col, while a merge produces a brand new
 * tile at the target cell and turns both parents into short-lived `ghosts`
 * that finish their slide before being dropped.
 */

export const SIZE = 4;
export const WINNING_VALUE = 2048;

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Tile {
    id: number;
    value: number;
    row: number;
    col: number;
    /** Spawned this turn — the view fades/pops it in. */
    isNew: boolean;
    /** Produced by a merge this turn — the view pops it. */
    isMerged: boolean;
}

export interface Board {
    tiles: Tile[];
    /** Parents of this turn's merges, still animating into place. */
    ghosts: Tile[];
    score: number;
    /** Set once a 2048 tile exists, so the win banner only shows once. */
    won: boolean;
    over: boolean;
}

const VECTORS: Record<Direction, { row: number; col: number }> = {
    up: { row: -1, col: 0 },
    down: { row: 1, col: 0 },
    left: { row: 0, col: -1 },
    right: { row: 0, col: 1 },
};

let nextId = 1;
const createId = () => nextId++;

const inBounds = (row: number, col: number) =>
    row >= 0 && row < SIZE && col >= 0 && col < SIZE;

const emptyGrid = (): (Tile | null)[][] =>
    Array.from({ length: SIZE }, () => Array<Tile | null>(SIZE).fill(null));

const toGrid = (tiles: Tile[]): (Tile | null)[][] => {
    const grid = emptyGrid();
    tiles.forEach((tile) => {
        grid[tile.row][tile.col] = tile;
    });
    return grid;
};

const freeCells = (grid: (Tile | null)[][]) => {
    const cells: { row: number; col: number }[] = [];
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (!grid[row][col]) cells.push({ row, col });
        }
    }
    return cells;
};

/** 90% twos, 10% fours — the ratio the original game uses. */
const spawnTile = (grid: (Tile | null)[][]): Tile | null => {
    const cells = freeCells(grid);
    if (cells.length === 0) return null;

    const { row, col } = cells[Math.floor(Math.random() * cells.length)];
    const tile: Tile = {
        id: createId(),
        value: Math.random() < 0.9 ? 2 : 4,
        row,
        col,
        isNew: true,
        isMerged: false,
    };
    grid[row][col] = tile;
    return tile;
};

const flatten = (grid: (Tile | null)[][]): Tile[] =>
    grid.flat().filter((tile): tile is Tile => tile !== null);

/** Any empty cell, or any pair of equal neighbours, means the game continues. */
const hasMoves = (grid: (Tile | null)[][]): boolean => {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const tile = grid[row][col];
            if (!tile) return true;
            if (col + 1 < SIZE && grid[row][col + 1]?.value === tile.value)
                return true;
            if (row + 1 < SIZE && grid[row + 1][col]?.value === tile.value)
                return true;
        }
    }
    return false;
};

export const createBoard = (): Board => {
    const grid = emptyGrid();
    spawnTile(grid);
    spawnTile(grid);

    return {
        tiles: flatten(grid),
        ghosts: [],
        score: 0,
        won: false,
        over: false,
    };
};

/**
 * Traverse from the far edge inwards, so the tile closest to the wall settles
 * first and the ones behind it stack against it.
 */
const traversalOrder = (direction: Direction) => {
    const vector = VECTORS[direction];
    const rows = [...Array(SIZE).keys()];
    const cols = [...Array(SIZE).keys()];
    if (vector.row > 0) rows.reverse();
    if (vector.col > 0) cols.reverse();
    return { rows, cols };
};

export interface MoveResult {
    board: Board;
    /** false when nothing shifted — the turn is a no-op and no tile spawns. */
    moved: boolean;
    /** Points earned this turn, for the floating "+N" indicator. */
    gained: number;
}

export const move = (board: Board, direction: Direction): MoveResult => {
    const vector = VECTORS[direction];
    const { rows, cols } = traversalOrder(direction);

    // Work on copies so the previous board stays intact for undo.
    const grid = toGrid(
        board.tiles.map((tile) => ({ ...tile, isNew: false, isMerged: false }))
    );

    const ghosts: Tile[] = [];
    const mergedCells = new Set<string>();
    let moved = false;
    let gained = 0;

    for (const row of rows) {
        for (const col of cols) {
            const tile = grid[row][col];
            if (!tile) continue;

            grid[row][col] = null;

            let r = row;
            let c = col;
            let mergeWith: Tile | null = null;

            // Slide until blocked, then decide whether that blocker merges.
            for (;;) {
                const nr = r + vector.row;
                const nc = c + vector.col;
                if (!inBounds(nr, nc)) break;

                const neighbour = grid[nr][nc];
                if (!neighbour) {
                    r = nr;
                    c = nc;
                    continue;
                }
                if (
                    neighbour.value === tile.value &&
                    !mergedCells.has(`${nr}:${nc}`)
                ) {
                    mergeWith = neighbour;
                    r = nr;
                    c = nc;
                }
                break;
            }

            if (mergeWith) {
                const value = tile.value * 2;
                gained += value;
                mergedCells.add(`${r}:${c}`);
                moved = true;

                // Both parents finish their slide as ghosts under the new tile.
                ghosts.push({ ...tile, row: r, col: c });
                ghosts.push({ ...mergeWith });

                grid[r][c] = {
                    id: createId(),
                    value,
                    row: r,
                    col: c,
                    isNew: false,
                    isMerged: true,
                };
            } else {
                if (r !== row || c !== col) moved = true;
                grid[r][c] = { ...tile, row: r, col: c };
            }
        }
    }

    if (!moved) return { board, moved: false, gained: 0 };

    spawnTile(grid);

    const tiles = flatten(grid);
    const score = board.score + gained;

    return {
        board: {
            tiles,
            ghosts,
            score,
            won: board.won || tiles.some((tile) => tile.value >= WINNING_VALUE),
            over: !hasMoves(grid),
        },
        moved: true,
        gained,
    };
};

/** Drops the ghost layer once its slide has finished. */
export const settle = (board: Board): Board =>
    board.ghosts.length === 0 ? board : { ...board, ghosts: [] };

/**
 * Ids are minted from a module-level counter, so a board restored from
 * storage has to push the counter past whatever it contains.
 */
export const reserveIds = (tiles: Tile[]) => {
    const max = tiles.reduce((acc, tile) => Math.max(acc, tile.id), 0);
    nextId = Math.max(nextId, max + 1);
};

export const isBoard = (value: unknown): value is Board => {
    if (typeof value !== 'object' || value === null) return false;
    const board = value as Partial<Board>;
    return (
        Array.isArray(board.tiles) &&
        typeof board.score === 'number' &&
        board.tiles.every(
            (tile) =>
                typeof tile?.id === 'number' &&
                typeof tile?.value === 'number' &&
                inBounds(tile?.row, tile?.col)
        )
    );
};
