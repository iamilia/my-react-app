import {
    type HTMLAttributes,
    type PointerEvent,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';

interface WindowProps extends HTMLAttributes<HTMLDivElement> {
    /** Printed in the title bar. Decorative — the content carries its own heading. */
    title: string;
    children: ReactNode;
    bodyClassName?: string;
}

const ZOOM_STEPS = [0, 1, 2, 3];

/** Whichever window was grabbed last sits on top of the others. */
let topZ = 20;

/**
 * A System 1 document window — striped title bar with a close box and a
 * zoom box, hard frame, hard drop shadow. Every section of the site sits in
 * one of these on the dithered desktop.
 *
 * It behaves like one, too:
 * - it plays the Finder's zoom-open (outline rectangles growing from the
 *   centre) the first time it scrolls into view;
 * - with a mouse, the title bar drags it around the desktop;
 * - the close box rolls it up to its title bar and back (a window shade —
 *   nothing on a portfolio should really close);
 * - the zoom box puts it back where it belongs and plays the zoom again.
 *
 * Dragging is mouse/pen only: on touch the title bar has to stay a place
 * you can start a scroll from.
 */
export const Window = ({
    title,
    children,
    className = '',
    bodyClassName = '',
    style,
    ...rest
}: WindowProps) => {
    const { t } = useTranslation();
    const stageRef = useRef<HTMLDivElement>(null);
    const drag = useRef<{ x: number; y: number } | null>(null);
    const [open, setOpen] = useState(false);
    const [replay, setReplay] = useState(0);
    const [shaded, setShaded] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [z, setZ] = useState<number>();

    useEffect(() => {
        const el = stageRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') {
            setOpen(true);
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setOpen(true);
                io.disconnect();
            },
            { rootMargin: '0px 0px -8% 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'touch' || e.button !== 0) return;
        if ((e.target as HTMLElement).closest('button')) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
        setZ(++topZ);
    };

    const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
        if (!drag.current) return;
        setOffset({
            x: e.clientX - drag.current.x,
            y: e.clientY - drag.current.y,
        });
    };

    const endDrag = () => {
        drag.current = null;
    };

    const reset = () => {
        setOffset({ x: 0, y: 0 });
        setShaded(false);
        setReplay((n) => n + 1);
    };

    const moved = offset.x !== 0 || offset.y !== 0;

    return (
        <div
            ref={stageRef}
            className={`zoom-stage ${open ? 'is-open' : ''} ${className}`}
            style={{ ...style, zIndex: z }}
        >
            {open &&
                ZOOM_STEPS.map((i) => (
                    <span
                        key={`${replay}-${i}`}
                        className="zoom-rect"
                        aria-hidden="true"
                        style={{
                            ['--i' as string]: i,
                            translate: `${offset.x}px ${offset.y}px`,
                        }}
                    />
                ))}
            <div
                className={`window ${moved ? 'is-moved' : ''}`}
                style={{ translate: `${offset.x}px ${offset.y}px` }}
                {...rest}
            >
                {/* Dragging is a mouse nicety; the zoom box is the keyboard way
                    to put a window back, so the bar needs no role of its own. */}
                {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer-only drag handle */}
                <div
                    className="window-bar"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onDoubleClick={reset}
                >
                    <button
                        type="button"
                        className="window-box"
                        onClick={() => setShaded((s) => !s)}
                        aria-expanded={!shaded}
                        aria-label={
                            shaded ? t('window.expand') : t('window.collapse')
                        }
                        title={
                            shaded ? t('window.expand') : t('window.collapse')
                        }
                    />
                    <span className="window-title" aria-hidden="true">
                        {title}
                    </span>
                    <button
                        type="button"
                        className="window-box window-box-zoom"
                        onClick={reset}
                        aria-label={t('window.reset')}
                        title={t('window.reset')}
                    />
                </div>
                <div className={`window-body ${bodyClassName}`} hidden={shaded}>
                    {children}
                </div>
            </div>
        </div>
    );
};
