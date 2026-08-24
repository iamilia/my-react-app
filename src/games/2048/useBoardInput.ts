import { useEffect, useRef, type RefObject } from 'react';
import type { Direction } from './engine';

const KEY_MAP: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    s: 'down',
    a: 'left',
    d: 'right',
    W: 'up',
    S: 'down',
    A: 'left',
    D: 'right',
};

/** Ignore the small drags that are really just taps. */
const SWIPE_THRESHOLD = 24;

/**
 * Arrow keys / WASD anywhere on the page, plus swipes on the board itself.
 * Both suppress the browser default (scrolling the page, pull-to-refresh) so
 * playing doesn't drag the layout around underneath you.
 */
export const useBoardInput = (
    boardRef: RefObject<HTMLElement | null>,
    play: (direction: Direction) => void
) => {
    const playRef = useRef(play);
    playRef.current = play;

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;

            const target = event.target as HTMLElement | null;
            const tag = target?.tagName;
            if (
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                target?.isContentEditable
            )
                return;

            const direction = KEY_MAP[event.key];
            if (!direction) return;

            event.preventDefault();
            playRef.current(direction);
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    useEffect(() => {
        const node = boardRef.current;
        if (!node) return;

        let startX = 0;
        let startY = 0;
        let tracking = false;

        const onTouchStart = (event: TouchEvent) => {
            if (event.touches.length !== 1) return;
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
            tracking = true;
        };

        const onTouchMove = (event: TouchEvent) => {
            if (tracking) event.preventDefault();
        };

        const onTouchEnd = (event: TouchEvent) => {
            if (!tracking) return;
            tracking = false;

            const touch = event.changedTouches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;

            if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;

            playRef.current(
                Math.abs(dx) > Math.abs(dy)
                    ? dx > 0
                        ? 'right'
                        : 'left'
                    : dy > 0
                      ? 'down'
                      : 'up'
            );
        };

        node.addEventListener('touchstart', onTouchStart, { passive: true });
        node.addEventListener('touchmove', onTouchMove, { passive: false });
        node.addEventListener('touchend', onTouchEnd, { passive: true });
        node.addEventListener('touchcancel', onTouchEnd, { passive: true });

        return () => {
            node.removeEventListener('touchstart', onTouchStart);
            node.removeEventListener('touchmove', onTouchMove);
            node.removeEventListener('touchend', onTouchEnd);
            node.removeEventListener('touchcancel', onTouchEnd);
        };
    }, [boardRef]);
};
