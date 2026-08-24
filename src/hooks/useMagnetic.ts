import { useEffect, useRef } from 'react';

/**
 * Makes an element lean toward the pointer while the pointer is over it, and
 * settle back when it leaves.
 *
 * Deliberately weak — `strength` is the fraction of the distance from the
 * element's centre that it will travel, and past about 0.35 a button stops
 * feeling responsive and starts feeling like it is dodging the cursor.
 *
 * Skipped entirely on coarse pointers (there is no hover to track on a
 * touchscreen, and the listener would only fire mid-tap) and under
 * `prefers-reduced-motion`.
 */
export const useMagnetic = <T extends HTMLElement = HTMLElement>(
    strength = 0.25
) => {
    const ref = useRef<T | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (
            typeof window.matchMedia !== 'function' ||
            !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            return;
        }

        let frame = 0;
        let pending: { x: number; y: number } | null = null;

        const apply = () => {
            frame = 0;
            if (!pending) return;
            el.style.transform = `translate3d(${pending.x}px, ${pending.y}px, 0)`;
        };

        const onMove = (event: PointerEvent) => {
            const box = el.getBoundingClientRect();
            pending = {
                x: (event.clientX - (box.left + box.width / 2)) * strength,
                y: (event.clientY - (box.top + box.height / 2)) * strength,
            };
            if (!frame) frame = requestAnimationFrame(apply);
        };

        const onLeave = () => {
            pending = null;
            if (frame) {
                cancelAnimationFrame(frame);
                frame = 0;
            }
            // The transform is set inline on every move, so the return trip
            // needs its own transition — the class's `transition` list covers
            // colour and shadow only, and adding `transform` there would put
            // a lag on the tracking itself.
            el.style.transition =
                'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
            el.style.transform = '';
        };

        const onEnter = () => {
            // Drop the settle transition while tracking, so the element sits
            // under the cursor instead of trailing half a second behind it.
            el.style.transition = '';
        };

        el.addEventListener('pointerenter', onEnter);
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);

        return () => {
            if (frame) cancelAnimationFrame(frame);
            el.removeEventListener('pointerenter', onEnter);
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerleave', onLeave);
            el.style.transform = '';
            el.style.transition = '';
        };
    }, [strength]);

    return ref;
};
