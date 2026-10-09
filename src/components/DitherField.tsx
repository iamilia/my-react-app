import { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

/** One field pixel, in CSS px — the desk dither's own 4px tile. */
const CELL = 4;
/** The desktop moves in whole frames, like the old screens did. */
const FPS = 24;
const GLOW_R = 170;
const RIPPLE_SPEED = 520; // px/s
const RIPPLE_LIFE = 1.3; // s
const RIPPLE_W = 26;

/** 4×4 ordered-dither thresholds, 0..1. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
    (v) => (v + 0.5) / 16
);

/**
 * The desktop, alive. A low-resolution canvas fixed behind every window
 * that turns a brightness field into 1-bit pixels with an ordered dither:
 * a soft lamp that trails the mouse, a ring that spreads from every click
 * or tap, and a faint shimmer of its own so the page breathes even when
 * nobody is touching it.
 *
 * It draws only ink, onto a transparent canvas, so the CSS dot pattern on
 * <html> is still the desk underneath — and is all that's left when motion
 * is reduced and this renders nothing.
 */
export const DitherField = () => {
    const ref = useRef<HTMLCanvasElement>(null);
    const dark = useThemeStore((s) => s.darkMode);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
            return;

        const ink = dark ? 0xffffffff : 0xff000000; // ABGR, little-endian
        let gw = 0;
        let gh = 0;
        let image: ImageData;
        let px: Uint32Array;
        let sx: Float32Array;
        let sy: Float32Array;
        let sd: Float32Array;

        const resize = () => {
            gw = Math.ceil(window.innerWidth / CELL);
            gh = Math.ceil(window.innerHeight / CELL);
            canvas.width = gw;
            canvas.height = gh;
            image = ctx.createImageData(gw, gh);
            px = new Uint32Array(image.data.buffer);
            sx = new Float32Array(gw);
            sy = new Float32Array(gh);
            sd = new Float32Array(gw + gh);
        };

        // The lamp eases after the pointer; it is off until a mouse shows up.
        const target = { x: 0, y: 0, on: false };
        const lamp = { x: 0, y: 0, a: 0 };
        const ripples: { x: number; y: number; t: number }[] = [];

        const onMove = (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            if (!target.on) Object.assign(lamp, { x: e.clientX, y: e.clientY });
            Object.assign(target, { x: e.clientX, y: e.clientY, on: true });
        };
        const onLeave = () => {
            target.on = false;
        };
        const onDown = (e: PointerEvent) => {
            ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
            if (ripples.length > 6) ripples.shift();
        };

        let frame = 0;
        let last = 0;
        const draw = (now: number) => {
            frame = requestAnimationFrame(draw);
            if (now - last < 1000 / FPS) return;
            last = now;
            const time = now / 1000;

            lamp.x += (target.x - lamp.x) * 0.18;
            lamp.y += (target.y - lamp.y) * 0.18;
            lamp.a += ((target.on ? 1 : 0) - lamp.a) * 0.12;

            while (ripples.length && now - ripples[0].t > RIPPLE_LIFE * 1000)
                ripples.shift();

            // The shimmer is three crossing sine waves; tabulating them per
            // row, column and diagonal keeps the inner loop to additions.
            for (let x = 0; x < gw; x++)
                sx[x] = Math.sin(x * 0.07 + time * 0.5);
            for (let y = 0; y < gh; y++)
                sy[y] = Math.sin(y * 0.09 - time * 0.35);
            for (let i = 0; i < gw + gh; i++)
                sd[i] = Math.sin(i * 0.04 + time * 0.25);

            const lx = lamp.x / CELL;
            const ly = lamp.y / CELL;
            const lr = GLOW_R / CELL;
            const lr2 = lr * lr;
            const rings = ripples.map((r) => {
                const age = (now - r.t) / 1000;
                return {
                    x: r.x / CELL,
                    y: r.y / CELL,
                    r: (age * RIPPLE_SPEED) / CELL,
                    fade: 1 - age / RIPPLE_LIFE,
                };
            });
            const rw = RIPPLE_W / CELL;

            for (let y = 0; y < gh; y++) {
                const row = y * gw;
                const by = (y & 3) * 4;
                for (let x = 0; x < gw; x++) {
                    // ponytail: full-grid scan, ~130k cells at 1080p and 24fps
                    // is a few ms; tile it if a 4K screen ever stutters.
                    let v = (sx[x] + sy[y] + sd[x + y]) * 0.022;

                    if (lamp.a > 0.01) {
                        const dx = x - lx;
                        const dy = y - ly;
                        const d2 = dx * dx + dy * dy;
                        if (d2 < lr2) {
                            const f = 1 - Math.sqrt(d2) / lr;
                            v += f * f * 0.62 * lamp.a;
                        }
                    }

                    for (const r of rings) {
                        const d = Math.hypot(x - r.x, y - r.y);
                        const k = 1 - Math.abs(d - r.r) / rw;
                        if (k > 0) v += k * r.fade * 0.9;
                    }

                    px[row + x] = v > BAYER[by + (x & 3)] ? ink : 0;
                }
            }
            ctx.putImageData(image, 0, 0);
        };

        resize();
        frame = requestAnimationFrame(draw);
        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onDown, { passive: true });
        document.documentElement.addEventListener('pointerleave', onLeave);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onDown);
            document.documentElement.removeEventListener(
                'pointerleave',
                onLeave
            );
        };
    }, [dark]);

    return <canvas ref={ref} className="dither-field" />;
};
