import { useEffect, useRef } from 'react';

/**
 * Adds `.is-visible` to any descendant carrying `.reveal` once it scrolls
 * into view. Elements can opt into a stagger with `data-delay="120"` (ms).
 */
export const useReveal = <T extends HTMLElement = HTMLElement>() => {
    const ref = useRef<T | null>(null);

    useEffect(() => {
        const root = ref.current;
        if (!root) return;

        const targets = Array.from(
            root.querySelectorAll<HTMLElement>('.reveal')
        );
        if (targets.length === 0) return;

        if (!('IntersectionObserver' in window)) {
            targets.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target as HTMLElement;
                    const delay = Number(el.dataset.delay ?? 0);
                    window.setTimeout(
                        () => el.classList.add('is-visible'),
                        delay
                    );
                    observer.unobserve(el);
                });
            },
            { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
        );

        targets.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return ref;
};
