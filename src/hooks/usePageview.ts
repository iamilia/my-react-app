import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sendHit } from '../services/analyticsService';

/**
 * A `<Navigate replace>` lands on the real path in the very next commit, so
 * holding the hit for a moment lets the redirect cancel it. Long enough to
 * swallow every redirect in the app, short enough that a real visitor can't
 * navigate away before it fires.
 */
const REDIRECT_GRACE_MS = 100;

/**
 * Browsers discard background tabs and reload them when you come back, which
 * used to count as a fresh view every time. Anything inside this window is
 * treated as the same visit; past it, the visitor really did come back.
 */
const SESSION_MS = 30 * 60 * 1000;

/** Per tab on purpose — sessionStorage survives a reload but not a new tab. */
const KEY = 'ilia:last-pageview';

interface Mark {
    path: string;
    at: number;
}

const readMark = (): Mark | null => {
    try {
        const raw = sessionStorage.getItem(KEY);
        if (!raw) return null;

        const mark = JSON.parse(raw) as Partial<Mark>;
        if (typeof mark.path !== 'string' || typeof mark.at !== 'number') {
            return null;
        }
        return { path: mark.path, at: mark.at };
    } catch {
        /* blocked or corrupt — behave as if nothing had been sent */
        return null;
    }
};

const writeMark = (path: string): void => {
    try {
        sessionStorage.setItem(KEY, JSON.stringify({ path, at: Date.now() }));
    } catch {
        /* nothing to do: analytics must never break the page */
    }
};

/**
 * Reports one pageview per route change.
 *
 * The server never sees client-side navigations, so counting has to happen
 * here. Two things must not be counted: the path a redirect passed through,
 * and the reload a browser does when it restores a tab it had discarded.
 */
export const usePageview = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // My own dashboard shouldn't show up in my own numbers.
        if (pathname.startsWith('/admin')) return;

        const mark = readMark();
        if (
            mark &&
            mark.path === pathname &&
            Date.now() - mark.at < SESSION_MS
        ) {
            return;
        }

        const timer = setTimeout(() => {
            writeMark(pathname);
            sendHit(pathname);
        }, REDIRECT_GRACE_MS);

        return () => clearTimeout(timer);
    }, [pathname]);
};
