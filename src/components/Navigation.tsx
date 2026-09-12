import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconMenu2, IconX, IconSun, IconMoon } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNumbers } from '../hooks/useNumbers';
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

/** Space the burger button occupies once it appears (36px button + 12px gap). */
const BURGER_W = 48;
/** Flex gap between wordmark / links / controls, both sides. */
const GAPS = 48;

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
    const n = useNumbers();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const onHome = pathname === '/';
    const onGames = pathname.startsWith('/game');

    const barRef = useRef<HTMLDivElement>(null);
    const wordmarkRef = useRef<HTMLButtonElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);
    const rulerRef = useRef<HTMLDivElement>(null);
    const burgerRef = useRef<HTMLButtonElement>(null);
    const menuPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
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

    // Re-measure when the labels themselves change length. `language` and `t`
    // are triggers, not inputs — `measure` reads the widths off the DOM, so
    // the only way to catch a label swap is to depend on what caused it.
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional triggers
    useLayoutEffect(() => {
        measure();
    }, [language, t, measure]);

    // The burger is gone once the links fit, so don't leave the panel hanging open
    useEffect(() => {
        if (!compact) setMobileMenuOpen(false);
    }, [compact]);

    // Escape and an outside click both close the panel and hand focus back
    // to the button that opened it, same as a click on a nav item would.
    useEffect(() => {
        if (!mobileMenuOpen) return;

        const close = () => {
            setMobileMenuOpen(false);
            burgerRef.current?.focus();
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as Node;
            if (
                menuPanelRef.current?.contains(target) ||
                burgerRef.current?.contains(target)
            ) {
                return;
            }
            close();
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [mobileMenuOpen]);

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
        measuring = false
    ) => (
        <button
            key={item.id}
            type="button"
            onClick={measuring ? undefined : () => go(item)}
            tabIndex={measuring ? -1 : undefined}
            className={`nav-link relative py-2 text-[0.9375rem] whitespace-nowrap transition-colors duration-200 ${
                active === item.id
                    ? 'text-accent'
                    : 'text-muted hover:text-(--fg)'
            }`}
        >
            {t(`navigation.${item.id}`)}
            {/* Always mounted rather than conditional on `active`, so the
                same element can grow on hover and stay grown while the
                section is in view — a rule that only exists when active can
                only ever appear, never animate.

                Kept out of the off-screen ruler: it is absolutely positioned
                and contributes nothing to the width being measured, and one
                fewer node per item keeps that measurement cheap. */}
            {!measuring && (
                <span
                    className={`nav-underline ${
                        active === item.id ? 'nav-underline-active' : ''
                    }`}
                />
            )}
        </button>
    );

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
                scrolled || mobileMenuOpen
                    ? 'glass border-b border-(--line)'
                    : 'border-b border-transparent'
            }`}
        >
            <div className="wrap">
                <div
                    ref={barRef}
                    className="relative flex items-center justify-between gap-5 py-3 sm:gap-6 sm:py-4"
                >
                    {/* Wordmark */}
                    <button
                        ref={wordmarkRef}
                        type="button"
                        onClick={goHome}
                        className="display shrink-0 text-xl whitespace-nowrap transition-colors hover:text-(--accent) sm:text-2xl"
                    >
                        {t('navigation.userName')}
                    </button>

                    {/* Off-screen ruler: never painted, only measured */}
                    <div
                        ref={rulerRef}
                        aria-hidden="true"
                        className="pointer-events-none invisible absolute inset-s-0 top-0 flex items-center gap-7"
                    >
                        {NAV_ITEMS.map((item) => renderLink(item, true))}
                    </div>

                    {/* Links — shown only while they actually fit */}
                    <nav
                        className={`items-center gap-7 ${compact ? 'hidden' : 'flex'}`}
                    >
                        {NAV_ITEMS.map((item) => renderLink(item))}
                    </nav>

                    {/* Controls */}
                    <div className="flex shrink-0 items-center gap-2">
                        <div
                            ref={controlsRef}
                            className="flex items-center gap-2"
                        >
                            <button
                                type="button"
                                onClick={toggleLanguage}
                                className="text-muted inline-flex h-11 min-w-11 items-center justify-center px-1 text-xs font-semibold transition-colors hover:text-(--fg)"
                                title={
                                    language === 'en'
                                        ? 'Switch to Persian'
                                        : 'تغییر به انگلیسی'
                                }
                                aria-label="Toggle language"
                            >
                                <span
                                    className={
                                        language === 'en' ? 'text-accent' : ''
                                    }
                                >
                                    EN
                                </span>
                                <span className="mx-1 opacity-40">/</span>
                                {/* Vazirmatn covers Arabic script; Instrument does not */}
                                <span
                                    className={`font-vazir ${
                                        language === 'fa' ? 'text-accent' : ''
                                    }`}
                                >
                                    فا
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={toggleDarkMode}
                                className="text-muted inline-flex h-11 w-11 items-center justify-center transition-colors hover:text-(--fg)"
                                aria-label="Toggle theme"
                            >
                                {darkMode ? (
                                    <IconSun size={18} />
                                ) : (
                                    <IconMoon size={18} />
                                )}
                            </button>
                        </div>

                        {compact && (
                            <button
                                ref={burgerRef}
                                type="button"
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className={`inline-flex h-11 w-11 items-center justify-center transition-colors ${
                                    mobileMenuOpen
                                        ? 'text-accent'
                                        : 'text-muted hover:text-(--fg)'
                                }`}
                                aria-label="Toggle menu"
                                aria-expanded={mobileMenuOpen}
                                aria-controls="mobile-menu"
                            >
                                {mobileMenuOpen ? (
                                    <IconX size={22} />
                                ) : (
                                    <IconMenu2 size={22} />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Collapsed menu. Opacity and transform only — no max-height —
                so the panel settles as one motion instead of racing an
                eased curve against an arbitrary height cap. `.mobile-menu`
                is absolutely positioned (see style.css), so it never adds
                its real height to the fixed header above — closed, it
                can't sit, invisible but still full-height, over the hero
                underneath. It carries its own solid backing there too
                (nearly opaque, not the header's thin 72% glass tint) since
                it's no longer part of the header's box, and because a
                panel this tall sitting over a page's worth of text needs
                to actually hide it, not just tint it. Only mounted in
                `compact` layouts, so nothing lingers over the hero on a
                desktop viewport that never shows a burger at all. */}
            {compact && (
                <div
                    ref={menuPanelRef}
                    id="mobile-menu"
                    className={`mobile-menu ${mobileMenuOpen ? 'is-open' : ''}`}
                    aria-hidden={!mobileMenuOpen}
                    inert={!mobileMenuOpen}
                >
                    <div className="wrap pt-1 pb-8">
                        {NAV_ITEMS.map((item, i) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => go(item)}
                                className={`nav-link mobile-menu-item flex w-full items-baseline gap-4 border-t border-(--line) py-3.5 text-start transition-colors hover:text-(--accent) ${
                                    active === item.id ? 'text-accent' : ''
                                }`}
                                style={{ ['--menu-i' as string]: i }}
                            >
                                <span className="force-mono text-accent nums text-xs">
                                    {n(i + 1, 'padded')}
                                </span>
                                <span className="display text-2xl">
                                    {t(`navigation.${item.id}`)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};
