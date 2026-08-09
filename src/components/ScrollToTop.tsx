import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Browsers restore the previous scroll offset on a client-side navigation,
 * which drops you into the middle of the page you just opened. Hash targets
 * are left alone — Home handles those itself so the section scroll stays eased.
 */
export const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) return;
        window.scrollTo(0, 0);
    }, [pathname, hash]);

    return null;
};
