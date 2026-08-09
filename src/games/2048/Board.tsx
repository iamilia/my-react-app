import type { CSSProperties, RefObject } from 'react';
import { SIZE, type Board as BoardState, type Tile } from './engine';

interface BoardProps {
    board: BoardState;
    /** Swipes are bound here, so it has to be the element that covers the grid. */
    frameRef: RefObject<HTMLDivElement | null>;
    /** Dimmed while a win/loss overlay covers the grid. */
    frozen?: boolean;
}

interface Entry {
    tile: Tile;
    ghost: boolean;
}

const CELLS = Array.from({ length: SIZE * SIZE }, (_, i) => i);

/** Anything past 2048 shares the top-tier styling. */
const valueClass = (value: number) =>
    value > 2048 ? 'tile2048-max' : `tile2048-v${value}`;

const tileStyle = (tile: Tile): CSSProperties =>
    ({ '--row': tile.row, '--col': tile.col }) as CSSProperties;

export const Board = ({ board, frameRef, frozen = false }: BoardProps) => {
    /**
     * Ghosts and live tiles go into one keyed list so a tile that becomes a
     * ghost keeps the same DOM node and therefore keeps sliding. Sorting by id
     * keeps the DOM order stable across renders (ids only ever grow, so new
     * tiles append) — without it React would shuffle nodes and drop the
     * in-flight transition.
     */
    const entries: Entry[] = [
        ...board.ghosts.map((tile) => ({ tile, ghost: true })),
        ...board.tiles.map((tile) => ({ tile, ghost: false })),
    ].sort((a, b) => a.tile.id - b.tile.id);

    return (
        <div
            ref={frameRef}
            dir="ltr"
            className={`board2048-frame panel ${frozen ? 'board2048-frozen' : ''}`}
        >
            <div className="board2048">
                <div className="board2048-cells" aria-hidden="true">
                    {CELLS.map((i) => (
                        <span key={i} className="board2048-cell" />
                    ))}
                </div>

                {entries.map(({ tile, ghost }) => (
                    <div
                        key={tile.id}
                        className={[
                            'tile2048',
                            valueClass(tile.value),
                            `tile2048-d${String(tile.value).length}`,
                            ghost ? 'tile2048-ghost' : '',
                            !ghost && tile.isNew ? 'tile2048-new' : '',
                            !ghost && tile.isMerged ? 'tile2048-merged' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        style={tileStyle(tile)}
                        aria-hidden={ghost || undefined}
                    >
                        <span className="force-mono">{tile.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
