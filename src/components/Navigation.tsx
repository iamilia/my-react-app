import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    IconMenu2,
    IconX,
    IconSun,
    IconMoon,
    IconLanguage,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Language } from '../types/lang';

interface NavigationProps {
    userName: string;
    darkMode: boolean;
    toggleDarkMode: () => void;
    scrollToSection: (sectionId: string) => void;
    toggleLanguage: () => void;
    language: Language;
}

const SECTIONS = ['about', 'skills', 'projects', 'contact'] as const;

/** Space the burger button occupies once it appears (36px button + 8px gap). */
const BURGER_W = 44;
/** Flex gap between wordmark / links / controls, both sides. */
const GAPS = 24;

export const Navigation = ({
    darkMode,
    toggleDarkMode,
    scrollToSection,
    toggleLanguage,
    language,
}: NavigationProps) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [active, setActive] = useState<string>('');
    // true => links don't fit, show the burger instead
    const [compact, setCompact] = useState(false);
    const { t } = useTranslation();

    const barRef = useRef<HTMLDivElement>(null);
    const wordmarkRef = useRef<HTMLButtonElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);
    const rulerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActive(e.target.id);
                });
            },
            { rootMargin: '-45% 0px -50% 0px' }
        );
        SECTIONS.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    /**
     * Decide between the full link row and the burger by measuring, not by a
     * fixed breakpoint — Persian labels are noticeably wider than the English
     * ones, so a single `md:` cutoff squeezes them at some widths.
     *
     * The ruler is an off-screen copy of the link row that is always mounted,
     * so its natural width stays measurable even while the real row is hidden.
     * Every term below is independent of `compact` (the burger's width is
     * always counted), which keeps the decision monotonic in container width
     * and stops it oscillating around the threshold.
     */
    const measure = useCallback(() => {
        const bar = barRef.current;
        const ruler = rulerRef.current;
        const wordmark = wordmarkRef.current;
        const controls = controlsRef.current;
        if (!bar || !ruler || !wordmark || !controls) return;

        const needed =
            wordmark.offsetWidth +
            ruler.scrollWidth +
            controls.offsetWidth +
            BURGER_W +
            GAPS;

        setCompact(needed > bar.clientWidth);
    }, []);

    useLayoutEffect(() => {
        measure();
        const ro = new ResizeObserver(measure);
        if (barRef.current) ro.observe(barRef.current);
        if (rulerRef.current) ro.observe(rulerRef.current);
        return () => ro.disconnect();
    }, [measure]);

    // Re-measure when the labels themselves change length
    useLayoutEffect(() => {
        measure();
    }, [language, t, measure]);

    // The burger is gone once the links fit, so don't leave the panel hanging open
    useEffect(() => {
        if (!compact) setMobileMenuOpen(false);
    }, [compact]);

    const handleScrollToSection = (sectionId: string) => {
        scrollToSection(sectionId);
        setMobileMenuOpen(false);
    };

    const renderLink = (id: string, i: number, measuring = false) => (
        <button
            key={id}
            onClick={measuring ? undefined : () => scrollToSection(id)}
            tabIndex={measuring ? -1 : undefined}
            className={`nav-link relative rounded-full px-3.5 py-2 font-mono text-xs tracking-wider whitespace-nowrap uppercase transition-colors duration-300 lg:text-[0.8rem] ${
                active === id ? 'text-accent' : 'text-muted hover:text-(--fg)'
            }`}
        >
            <span className="force-mono me-2 opacity-40">0{i + 1}</span>
            {t(`navigation.${id}`)}
            {!measuring && active === id && (
                <span className="absolute inset-x-3 -bottom-px h-px bg-(--accent)" />
            )}
        </button>
    );

    return (
        <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
            <nav
                className={`panel mx-auto max-w-6xl transition-all duration-500 ${
                    scrolled || mobileMenuOpen
                        ? 'shadow-[0_18px_50px_-28px_var(--glow)]'
                        : 'border-transparent bg-transparent backdrop-blur-0'
                }`}
            >
                <div
                    ref={barRef}
                    className="relative flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
                >
                    {/* Wordmark */}
                    <button
                        ref={wordmarkRef}
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                        className="group flex shrink-0 items-center gap-2.5"
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--accent) opacity-60" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-(--accent)" />
                        </span>
                        <span className="font-mono text-sm font-semibold tracking-[0.2em] whitespace-nowrap uppercase sm:text-base">
                            {t('navigation.userName')}
                            <span className="text-accent">_</span>
                        </span>
                    </button>

                    {/* Off-screen ruler: never painted, only measured */}
                    <div
                        ref={rulerRef}
                        aria-hidden="true"
                        className="pointer-events-none invisible absolute inset-s-0 top-0 flex items-center gap-1"
                    >
                        {SECTIONS.map((id, i) => renderLink(id, i, true))}
                    </div>

                    {/* Links — shown only while they actually fit */}
                    <div
                        className={`items-center gap-1 ${compact ? 'hidden' : 'flex'}`}
                    >
                        {SECTIONS.map((id, i) => renderLink(id, i))}
                    </div>

                    {/* Controls */}
                    <div className="flex shrink-0 items-center gap-2">
                        <div ref={controlsRef} className="flex items-center gap-2">
                            <button
                                onClick={toggleLanguage}
                                className="icon-btn h-9 min-w-16 gap-1.5 px-3 text-xs font-semibold"
                                title={
                                    language === 'en'
                                        ? 'Switch to Persian'
                                        : 'تغییر به انگلیسی'
                                }
                                aria-label="Toggle language"
                            >
                                <IconLanguage size={15} className="shrink-0" />
                                {/* Vazir covers Arabic script; the mono face does not */}
                                <span className="font-vazir leading-none">
                                    {language === 'en' ? 'فارسی' : 'EN'}
                                </span>
                            </button>
                            <button
                                onClick={toggleDarkMode}
                                className="icon-btn h-9 w-9"
                                aria-label="Toggle theme"
                            >
                                {darkMode ? (
                                    <IconSun size={17} />
                                ) : (
                                    <IconMoon size={17} />
                                )}
                            </button>
                        </div>

                        {compact && (
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className={`icon-btn h-9 w-9 ${
                                    mobileMenuOpen
                                        ? 'border-(--line-strong) bg-(--accent-soft) text-accent'
                                        : ''
                                }`}
                                aria-label="Toggle menu"
                                aria-expanded={mobileMenuOpen}
                            >
                                {mobileMenuOpen ? (
                                    <IconX size={18} />
                                ) : (
                                    <IconMenu2 size={18} />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Collapsed menu */}
                <div
                    className={`overflow-hidden transition-[max-height] duration-500 ease-out ${
                        compact && mobileMenuOpen ? 'max-h-72' : 'max-h-0'
                    }`}
                >
                    <div className="px-4 pb-4 sm:px-6">
                        <hr className="hairline mb-3" />
                        <div className="flex flex-col">
                            {SECTIONS.map((id, i) => (
                                <button
                                    key={id}
                                    onClick={() => handleScrollToSection(id)}
                                    className="nav-link flex items-center gap-3 py-2.5 text-start font-mono text-sm tracking-wider uppercase transition-colors hover:text-(--accent)"
                                >
                                    <span className="force-mono text-accent text-[0.7rem] opacity-60">
                                        0{i + 1}
                                    </span>
                                    {t(`navigation.${id}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};
