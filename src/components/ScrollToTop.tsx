import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Browsers restore the previous scroll offset on a client-side navigation,
 * which drops you into the middle of the page you just opened. Hash targets
 * are left alone — Home handles those itself so the section scroll stays eased.
 */
export const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    // `pathname` is the trigger, not an input: the effect exists to run on
    // every route change even though it never reads the value.
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional trigger
    useEffect(() => {
        if (hash) return;
        window.scrollTo(0, 0);
    }, [pathname, hash]);

    return null;
};
