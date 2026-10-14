import { useEffect, useRef } from 'react';

/**
 * The calm behind everything: three large, heavily blurred colour fields on
 * minute-long drifts (pure CSS, see `.ambient-orb`), and a faint glow that
 * follows a mouse pointer with a long, easy lag.
 *
 * The glow writes its position to custom properties straight from a rAF
 * loop — no React state per frame — and the loop sleeps once the glow has
 * caught up, so an idle page costs nothing. Touch and reduced motion get the
 * orbs only.
 */
export const AmbientBackdrop = () => {
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const glow = glowRef.current;
        if (!glow) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
            return;

        const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const pos = { ...target };
        let frame = 0;

        const tick = () => {
            pos.x += (target.x - pos.x) * 0.06;
            pos.y += (target.y - pos.y) * 0.06;
            glow.style.setProperty('--gx', `${pos.x}px`);
            glow.style.setProperty('--gy', `${pos.y}px`);
            const settled =
                Math.abs(target.x - pos.x) < 0.5 &&
                Math.abs(target.y - pos.y) < 0.5;
            frame = settled ? 0 : requestAnimationFrame(tick);
        };

        const onMove = (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            target.x = e.clientX;
            target.y = e.clientY;
            glow.classList.add('is-on');
            if (!frame) frame = requestAnimationFrame(tick);
        };
        const onLeave = () => glow.classList.remove('is-on');

        window.addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onLeave);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('pointermove', onMove);
            document.documentElement.removeEventListener(
                'pointerleave',
                onLeave
            );
        };
    }, []);

    return (
        <div className="ambient" aria-hidden="true">
            <div className="ambient-orb" />
            <div className="ambient-orb" />
            <div className="ambient-orb" />
            <div ref={glowRef} className="ambient-glow" />
        </div>
    );
};
