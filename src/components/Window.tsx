import type { HTMLAttributes, ReactNode } from 'react';

interface WindowProps extends HTMLAttributes<HTMLDivElement> {
    /** Printed in the title bar. Decorative — the content carries its own heading. */
    title: string;
    children: ReactNode;
    bodyClassName?: string;
    /**
     * Play the Finder's zoom-open on mount: outline rectangles growing out
     * from the centre, then the window. Meant for one window per page.
     */
    zoom?: boolean;
}

const ZOOM_STEPS = [0, 1, 2, 3];

/**
 * A System 1 document window — striped title bar with a close box and a
 * zoom box, hard frame, hard drop shadow. Every section of the site sits in
 * one of these on the dithered desktop.
 *
 * The title bar is `aria-hidden`: it repeats what the section heading
 * already says, and the two boxes in it are ornaments, not controls.
 */
export const Window = ({
    title,
    children,
    className = '',
    bodyClassName = '',
    zoom = false,
    ...rest
}: WindowProps) => {
    const frame = (
        <div className={`window ${zoom ? '' : className}`} {...rest}>
            <div className="window-bar" aria-hidden="true">
                <span className="window-box" />
                <span className="window-title">{title}</span>
                <span className="window-box window-box-zoom" />
            </div>
            <div className={`window-body ${bodyClassName}`}>{children}</div>
        </div>
    );

    if (!zoom) return frame;

    return (
        <div className={`zoom-stage ${className}`}>
            {ZOOM_STEPS.map((i) => (
                <span
                    key={i}
                    className="zoom-rect"
                    aria-hidden="true"
                    style={{ ['--i' as string]: i }}
                />
            ))}
            {frame}
        </div>
    );
};
