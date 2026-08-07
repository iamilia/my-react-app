import { useEffect, useState } from 'react';
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
    const { t } = useTranslation();

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

    const handleScrollToSection = (sectionId: string) => {
        scrollToSection(sectionId);
        setMobileMenuOpen(false);
    };

    return (
        <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
            <nav
                className={`panel mx-auto max-w-6xl transition-all duration-500 ${
                    scrolled
                        ? 'shadow-[0_18px_50px_-28px_var(--glow)]'
                        : 'border-transparent bg-transparent backdrop-blur-0'
                }`}
            >
                <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    {/* Wordmark */}
                    <button
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                        className="group flex items-center gap-2.5"
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                        </span>
                        <span className="font-mono text-sm font-semibold tracking-[0.2em] uppercase sm:text-base">
                            {t('navigation.userName')}
                            <span className="text-accent">_</span>
                        </span>
                    </button>

                    {/* Desktop links */}
                    <div className="hidden items-center gap-1 md:flex">
                        {SECTIONS.map((id, i) => (
                            <button
                                key={id}
                                onClick={() => scrollToSection(id)}
                                className={`nav-link relative rounded-full px-3.5 py-2 font-mono text-xs tracking-wider uppercase transition-colors duration-300 lg:text-[0.8rem] ${
                                    active === id
                                        ? 'text-accent'
                                        : 'text-muted hover:text-[var(--fg)]'
                                }`}
                            >
                                <span className="force-mono me-2 opacity-40">
                                    0{i + 1}
                                </span>
                                {t(`navigation.${id}`)}
                                {active === id && (
                                    <span className="absolute inset-x-3 -bottom-px h-px bg-[var(--accent)]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleLanguage}
                            className="icon-btn h-9 min-w-[4rem] gap-1.5 px-3 text-xs font-semibold"
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
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="icon-btn h-9 w-9 md:hidden"
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? (
                                <IconX size={18} />
                            ) : (
                                <IconMenu2 size={18} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div
                    className={`overflow-hidden md:hidden ${
                        mobileMenuOpen ? 'max-h-72' : 'max-h-0'
                    } transition-[max-height] duration-500 ease-out`}
                >
                    <div className="px-4 pb-4 sm:px-6">
                        <hr className="hairline mb-3" />
                        <div className="flex flex-col">
                            {SECTIONS.map((id, i) => (
                                <button
                                    key={id}
                                    onClick={() => handleScrollToSection(id)}
                                    className="nav-link flex items-center gap-3 py-2.5 text-start font-mono text-sm tracking-wider uppercase transition-colors hover:text-[var(--accent)]"
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
