/**
 * Shared eased scrolling.
 *
 * `window.scrollTo({ behavior: 'smooth' })` uses the browser's own curve and
 * duration, which is noticeably snappier than the rest of the site's motion.
 * These helpers run the same ease-in-out-cubic used by the section links so a
 * jump to the top feels like every other jump on the page.
 */

const easeInOutCubic = (x: number) =>
    x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;

const prefersReducedMotion = () =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** Scroll to an absolute Y offset, easing over `duration` ms. */
export const smoothScrollTo = (targetY: number, duration = 700) => {
    const startY = window.scrollY;
    const distance = targetY - startY;

    if (distance === 0) return;

    if (prefersReducedMotion()) {
        window.scrollTo(0, targetY);
        return;
    }

    const startTime = performance.now();

    const step = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));
        if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
};

/** Scroll a section into view, leaving room for the fixed nav bar. */
export const smoothScrollToSection = (sectionId: string, offset = 80) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    smoothScrollTo(
        element.getBoundingClientRect().top + window.scrollY - offset
    );
};

/** Scroll back to the very top of the page. Longer, since it travels further. */
export const smoothScrollToTop = () => smoothScrollTo(0, 900);
