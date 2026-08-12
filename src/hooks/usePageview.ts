import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { sendHit } from '../services/analyticsService';

/**
 * Reports one pageview per route change.
 *
 * The server never sees client-side navigations, so counting has to happen
 * here. The ref guards against StrictMode's double-invoked effects in dev and
 * against re-renders that don't actually change the path.
 */
export const usePageview = () => {
    const { pathname } = useLocation();
    const lastSent = useRef<string | null>(null);

    useEffect(() => {
        if (lastSent.current === pathname) return;
        lastSent.current = pathname;

        // My own dashboard shouldn't show up in my own numbers.
        if (pathname.startsWith('/admin')) return;

        sendHit(pathname);
    }, [pathname]);
};
