import type { HTMLAttributes, ReactNode } from 'react';

interface WindowProps extends HTMLAttributes<HTMLDivElement> {
    /** Kept for the callers that still pass it; no longer drawn. */
    title?: string;
    children: ReactNode;
    bodyClassName?: string;
}

/**
 * Used to be a framed window with a title bar. Sections now sit straight on
 * the page, so this is only a wrapper — kept so every page that wraps its
 * content in one keeps working unchanged.
 */
export const Window = ({
    title: _title,
    children,
    className = '',
    bodyClassName = '',
    ...rest
}: WindowProps) => (
    <div className={`window ${className}`} {...rest}>
        <div className={`window-body ${bodyClassName}`}>{children}</div>
    </div>
);
