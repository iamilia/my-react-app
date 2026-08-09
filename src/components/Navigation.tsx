import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    toggleLanguage: () => void;
    language: Language;
    /** Only supplied by the home page, where the sections actually exist. */
    scrollToSection?: (sectionId: string) => void;
}

const SECTIONS = ['about', 'skills', 'work', 'projects', 'contact'] as const;

/** Sections first, then the routed pages that live outside the one-pager. */
const NAV_ITEMS = [
    ...SECTIONS.map((id) => ({ id, to: `/#${id}` })),
    { id: 'games', to: '/game' },
] as const;

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
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const onHome = pathname === '/';
    const onGames = pathname.startsWith('/game');

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
        if (!onHome) {
            setActive(onGames ? 'games' : '');
            return;
        }
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
    }, [onHome, onGames]);

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

    /**
     * On the home page the section links scroll; from anywhere else they route
     * home with a hash and let Home do the scrolling once its data has landed.
     */
    const go = (item: (typeof NAV_ITEMS)[number]) => {
        setMobileMenuOpen(false);
        if (item.id === 'games') {
            navigate(item.to);
            return;
        }
        if (onHome && scrollToSection) scrollToSection(item.id);
        else navigate(item.to);
    };

    const goHome = () => {
        setMobileMenuOpen(false);
        if (onHome) window.scrollTo({ top: 0, behavior: 'smooth' });
        else navigate('/');
    };

    const renderLink = (
        item: (typeof NAV_ITEMS)[number],
        i: number,
        measuring = false
    ) => (
        <button
            key={item.id}
            onClick={measuring ? undefined : () => go(item)}
            tabIndex={measuring ? -1 : undefined}
            className={`nav-link relative rounded-full px-3.5 py-2 font-mono text-xs tracking-wider whitespace-nowrap uppercase transition-colors duration-300 lg:text-[0.8rem] ${
                active === item.id ? 'text-accent' : 'text-muted hover:text-(--fg)'
            }`}
        >
            <span className="force-mono me-2 opacity-40">0{i + 1}</span>
            {t(`navigation.${item.id}`)}
            {!measuring && active === item.id && (
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
                        onClick={goHome}
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
                        {NAV_ITEMS.map((item, i) => renderLink(item, i, true))}
                    </div>

                    {/* Links — shown only while they actually fit */}
                    <div
                        className={`items-center gap-1 ${compact ? 'hidden' : 'flex'}`}
                    >
                        {NAV_ITEMS.map((item, i) => renderLink(item, i))}
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
                        compact && mobileMenuOpen ? 'max-h-96' : 'max-h-0'
                    }`}
                >
                    <div className="px-4 pb-4 sm:px-6">
                        <hr className="hairline mb-3" />
                        <div className="flex flex-col">
                            {NAV_ITEMS.map((item, i) => (
                                <button
                                    key={item.id}
                                    onClick={() => go(item)}
                                    className={`nav-link flex items-center gap-3 py-2.5 text-start font-mono text-sm tracking-wider uppercase transition-colors hover:text-(--accent) ${
                                        active === item.id ? 'text-accent' : ''
                                    }`}
                                >
                                    <span className="force-mono text-accent text-[0.7rem] opacity-60">
                                        0{i + 1}
                                    </span>
                                    {t(`navigation.${item.id}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};
