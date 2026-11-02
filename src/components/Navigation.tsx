import { IconMenu2, IconMoon, IconSun, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
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

const SECTIONS = ['projects', 'work', 'about', 'skills', 'contact'] as const;

/** Sections first, then the routed pages that live outside the one-pager. */
const NAV_ITEMS = [
    ...SECTIONS.map((id) => ({ id, to: `/#${id}` })),
    { id: 'games', to: '/game' },
    { id: 'metro', to: '/metro' },
] as const;

/**
 * The menu-bar clock, set to Tehran — so a visitor can see what time it is
 * where I am. The colon blinks with the seconds.
 */
const LocalClock = ({ language }: { language: Language }) => {
    const { t } = useTranslation();
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const parts = new Intl.DateTimeFormat(
        language === 'fa' ? 'fa-IR' : 'en-GB',
        { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' }
    ).formatToParts(now);
    const part = (type: string) => parts.find((p) => p.type === type)?.value;

    return (
        <span className="menubar-item nums hidden cursor-default! gap-2 hover:text-(--fg-muted)! sm:inline-flex">
            <span className="text-muted">{t('navigation.localTime')}</span>
            <time dir="ltr" dateTime={now.toISOString()}>
                {part('hour')}
                <span className={now.getSeconds() % 2 ? 'opacity-40' : ''}>
                    :
                </span>
                {part('minute')}
            </time>
        </span>
    );
};

/** Space the burger button occupies once it appears (44px button + 8px gap). */
const BURGER_W = 52;
/** Flex gap between wordmark / links / controls, both sides. */
const GAPS = 32;

export const Navigation = ({
    darkMode,
    toggleDarkMode,
    scrollToSection,
    toggleLanguage,
    language,
}: NavigationProps) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [active, setActive] = useState<string>('');
    // true => links don't fit, show the burger instead
    const [compact, setCompact] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const reduce = useReducedMotion();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const onHome = pathname === '/';
    const onGames = pathname.startsWith('/game');
    const onMetro = pathname.startsWith('/metro');

    const barRef = useRef<HTMLDivElement>(null);
    const wordmarkRef = useRef<HTMLButtonElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);
    const rulerRef = useRef<HTMLDivElement>(null);
    const burgerRef = useRef<HTMLButtonElement>(null);
    const menuPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!onHome) {
            setActive(onGames ? 'games' : onMetro ? 'metro' : '');
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
    }, [onHome, onGames, onMetro]);

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

    // Transparent over the hero, frosted once the page moves under it.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // The open menu covers the page; the page underneath must not scroll.
    useEffect(() => {
        if (!mobileMenuOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [mobileMenuOpen]);

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
        if (item.id === 'games' || item.id === 'metro') {
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
    ) => {
        const isActive = !measuring && active === item.id;
        return (
            <button
                key={item.id}
                type="button"
                onClick={measuring ? undefined : () => go(item)}
                tabIndex={measuring ? -1 : undefined}
                aria-current={isActive ? 'true' : undefined}
                className={`menubar-item isolate ${isActive ? 'is-active' : ''}`}
            >
                {isActive && (
                    <motion.span
                        layoutId="nav-pill"
                        className="nav-pill"
                        transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 32,
                        }}
                    />
                )}
                {t(`navigation.${item.id}`)}
            </button>
        );
    };

    // backdrop-filter would make the fixed menu panel size itself to the
    // bar, so the bar stays clear while the menu is open.
    const frosted = scrolled && !mobileMenuOpen;

    return (
        <motion.header
            className={`menubar fixed inset-x-0 top-0 z-50 ${frosted ? 'is-scrolled' : ''}`}
            initial={reduce ? false : { y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="wrap">
                <div
                    ref={barRef}
                    className="relative flex min-h-16 items-center justify-between gap-3 sm:gap-4"
                >
                    {/* Wordmark: a station ring and the name */}
                    <button
                        ref={wordmarkRef}
                        type="button"
                        onClick={goHome}
                        className="menubar-item menubar-brand -ms-3 shrink-0 gap-2"
                    >
                        <span
                            aria-hidden="true"
                            className="size-3 rounded-full border-[3px] border-(--color-route)"
                        />
                        {t('navigation.userName')}
                    </button>

                    {/* Off-screen ruler: never painted, only measured */}
                    <div
                        ref={rulerRef}
                        aria-hidden="true"
                        className="pointer-events-none invisible absolute inset-s-0 top-0 flex items-center"
                    >
                        {NAV_ITEMS.map((item) => renderLink(item, true))}
                    </div>

                    {/* Links — shown only while they actually fit */}
                    <nav
                        className={`items-center ${compact ? 'hidden' : 'flex'}`}
                    >
                        {NAV_ITEMS.map((item) => renderLink(item))}
                    </nav>

                    {/* Controls */}
                    <div className="-me-3 flex shrink-0 items-center gap-1">
                        <div ref={controlsRef} className="flex items-center">
                            <LocalClock language={language} />
                            <button
                                type="button"
                                onClick={toggleLanguage}
                                className="menubar-item"
                                title={
                                    language === 'en'
                                        ? 'Switch to Persian'
                                        : 'تغییر به انگلیسی'
                                }
                                aria-label="Toggle language"
                            >
                                {language === 'en' ? (
                                    <span className="font-vazir" lang="fa">
                                        فا
                                    </span>
                                ) : (
                                    <span lang="en">EN</span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={toggleDarkMode}
                                className="menubar-item"
                                aria-label="Toggle theme"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={darkMode ? 'sun' : 'moon'}
                                        className="flex"
                                        initial={
                                            reduce
                                                ? false
                                                : {
                                                      rotate: -90,
                                                      scale: 0.4,
                                                      opacity: 0,
                                                  }
                                        }
                                        animate={{
                                            rotate: 0,
                                            scale: 1,
                                            opacity: 1,
                                        }}
                                        exit={
                                            reduce
                                                ? undefined
                                                : {
                                                      rotate: 90,
                                                      scale: 0.4,
                                                      opacity: 0,
                                                  }
                                        }
                                        transition={{ duration: 0.25 }}
                                    >
                                        {darkMode ? (
                                            <IconSun size={18} />
                                        ) : (
                                            <IconMoon size={18} />
                                        )}
                                    </motion.span>
                                </AnimatePresence>
                            </button>
                        </div>

                        {compact && (
                            <button
                                ref={burgerRef}
                                type="button"
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className={`menubar-item ${mobileMenuOpen ? 'is-active' : ''}`}
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

            {/* Full-screen menu: the links as big type, one after another. */}
            <AnimatePresence>
                {compact && mobileMenuOpen && (
                    <motion.div
                        ref={menuPanelRef}
                        id="mobile-menu"
                        className="mobile-menu"
                        initial={
                            reduce ? false : { clipPath: 'inset(0 0 100% 0)' }
                        }
                        animate={{ clipPath: 'inset(0 0 0% 0)' }}
                        exit={
                            reduce
                                ? undefined
                                : { clipPath: 'inset(0 0 100% 0)' }
                        }
                        transition={{
                            duration: 0.55,
                            ease: [0.65, 0, 0.35, 1],
                        }}
                    >
                        <motion.ul
                            className="wrap m-0 flex list-none flex-col gap-1 pt-24 pb-12"
                            initial="hidden"
                            animate="shown"
                            transition={{
                                staggerChildren: 0.05,
                                delayChildren: 0.2,
                            }}
                        >
                            {NAV_ITEMS.map((item, i) => (
                                <motion.li
                                    key={item.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 32 },
                                        shown: { opacity: 1, y: 0 },
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => go(item)}
                                        aria-current={
                                            active === item.id
                                                ? 'true'
                                                : undefined
                                        }
                                        className="mobile-menu-item flex min-h-14 w-full items-baseline gap-4 text-start"
                                    >
                                        <span className="station-no">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span
                                            className={
                                                active === item.id
                                                    ? 'text-(--accent)'
                                                    : ''
                                            }
                                        >
                                            {t(`navigation.${item.id}`)}
                                        </span>
                                    </button>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};
