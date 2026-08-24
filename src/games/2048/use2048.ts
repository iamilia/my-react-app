import { useCallback, useEffect, useRef, useState } from 'react';
import {
    createBoard,
    isBoard,
    move as applyMove,
    reserveIds,
    settle,
    type Board,
    type Direction,
} from './engine';

const STATE_KEY = 'game2048:state';
const BEST_KEY = 'game2048:best';

/** Long enough for a tile to finish sliding before its ghost is dropped. */
const SLIDE_MS = 130;

interface SavedState {
    board: Board;
    best: number;
    dismissedWin: boolean;
}

const readNumber = (key: string): number => {
    try {
        const raw = localStorage.getItem(key);
        const value = raw === null ? 0 : Number(raw);
        return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch {
        return 0;
    }
};

const readSaved = (): SavedState | null => {
    try {
        const raw = localStorage.getItem(STATE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as {
            board?: unknown;
            dismissedWin?: unknown;
        };
        if (!isBoard(parsed.board)) return null;
        // Ghosts are a per-turn animation detail; never restore them.
        const board: Board = { ...parsed.board, ghosts: [] };
        reserveIds(board.tiles);
        return {
            board,
            best: readNumber(BEST_KEY),
            dismissedWin: parsed.dismissedWin === true,
        };
    } catch {
        return null;
    }
};

const freshState = (): SavedState => ({
    board: createBoard(),
    best: readNumber(BEST_KEY),
    dismissedWin: false,
});

export const use2048 = () => {
    const [{ board, best, dismissedWin }, setState] = useState<SavedState>(
        () => readSaved() ?? freshState()
    );
    const [previous, setPrevious] = useState<Board | null>(null);
    const [gained, setGained] = useState<{
        amount: number;
        key: number;
    } | null>(null);

    const settleTimer = useRef<number | undefined>(undefined);

    // Persist after every change so a refresh drops you back into the game.
    useEffect(() => {
        try {
            localStorage.setItem(
                STATE_KEY,
                JSON.stringify({
                    board: { ...board, ghosts: [] },
                    dismissedWin,
                })
            );
            localStorage.setItem(BEST_KEY, String(best));
        } catch {
            /* storage unavailable — the game still plays, just not across reloads */
        }
    }, [board, best, dismissedWin]);

    useEffect(() => () => window.clearTimeout(settleTimer.current), []);

    const scheduleSettle = useCallback(() => {
        window.clearTimeout(settleTimer.current);
        settleTimer.current = window.setTimeout(() => {
            setState((prev) => ({ ...prev, board: settle(prev.board) }));
        }, SLIDE_MS);
    }, []);

    const play = useCallback(
        (direction: Direction) => {
            setState((prev) => {
                if (prev.board.over) return prev;
                if (prev.board.won && !prev.dismissedWin) return prev;

                const result = applyMove(prev.board, direction);
                if (!result.moved) return prev;

                setPrevious(prev.board);
                setGained({ amount: result.gained, key: Date.now() });

                return {
                    ...prev,
                    board: result.board,
                    best: Math.max(prev.best, result.board.score),
                };
            });
            scheduleSettle();
        },
        [scheduleSettle]
    );

    const restart = useCallback(() => {
        window.clearTimeout(settleTimer.current);
        setPrevious(null);
        setGained(null);
        setState((prev) => ({
            board: createBoard(),
            best: prev.best,
            dismissedWin: false,
        }));
    }, []);

    /** One step back, and only one — enough to fix a misfire, not to cheat. */
    const undo = useCallback(() => {
        if (!previous) return;
        window.clearTimeout(settleTimer.current);
        setGained(null);
        setState((prev) => ({ ...prev, board: { ...previous, ghosts: [] } }));
        setPrevious(null);
    }, [previous]);

    const keepPlaying = useCallback(
        () => setState((prev) => ({ ...prev, dismissedWin: true })),
        []
    );

    return {
        board,
        best,
        gained,
        canUndo: previous !== null,
        showWin: board.won && !dismissedWin,
        showLoss: board.over,
        play,
        restart,
        undo,
        keepPlaying,
    };
};
