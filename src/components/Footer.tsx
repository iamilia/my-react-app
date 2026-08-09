import { IconArrowUp, IconHeartFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';
import { smoothScrollToTop } from '../utils/scroll';

interface FooterProps {
    userName: string;
    /** Only supplied by the home page, where the sections actually exist. */
    scrollToSection?: (sectionId: string) => void;
}

const SECTIONS = ['about', 'skills', 'work', 'projects', 'contact'] as const;

const NAV_ITEMS = [
    ...SECTIONS.map((id) => ({ id, to: `/#${id}` })),
    { id: 'games', to: '/game' },
] as const;

const STACK = [
    { label: 'React', href: 'https://react.dev' },
    { label: 'TypeScript', href: 'https://www.typescriptlang.org' },
    { label: 'Tailwind CSS', href: 'https://tailwindcss.com' },
    { label: 'Vite', href: 'https://vite.dev' },
];

export const Footer = ({ userName, scrollToSection }: FooterProps) => {
    const { t } = useTranslation();
    const ref = useReveal<HTMLElement>();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const onHome = pathname === '/';

    const scrollToTop = () => {
        if (onHome) smoothScrollToTop();
        else navigate('/');
    };

    /** Same rule as the header: scroll on home, route with a hash elsewhere. */
    const go = (item: (typeof NAV_ITEMS)[number]) => {
        if (item.id !== 'games' && onHome && scrollToSection) {
            scrollToSection(item.id);
            return;
        }
        navigate(item.to);
    };

    return (
        <footer ref={ref} className="relative overflow-hidden px-4 sm:px-6 lg:px-8">
            {/* ambient wash so the page fades out instead of stopping dead */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-full"
                style={{
                    background:
                        'radial-gradient(720px circle at 50% 118%, var(--accent-soft), transparent 62%)',
                }}
            />

            <div className="relative mx-auto max-w-6xl">
                <hr className="hairline" />

                {/* ---------------- main columns ---------------- */}
                <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr] lg:gap-14">
                    {/* Brand */}
                    <div className="reveal sm:col-span-2 lg:col-span-1">
                        <button
                            onClick={scrollToTop}
                            className="group flex items-center gap-2.5"
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--accent) opacity-60" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-(--accent)" />
                            </span>
                            <span className="font-mono text-base font-semibold tracking-[0.2em] uppercase transition-colors group-hover:text-(--accent)">
                                {userName}
                                <span className="text-accent">_</span>
                            </span>
                        </button>

                        <p className="text-muted mt-4 max-w-xs text-sm leading-relaxed">
                            {t('footer.tagline')}
                        </p>

                        <span className="chip mt-6">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--accent) opacity-70" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--accent)" />
                            </span>
                            {t('hero.available')}
                        </span>
                    </div>

                    {/* Navigate */}
                    <nav className="reveal" data-delay="80">
                        <h3 className="text-muted font-mono text-[0.66rem] tracking-[0.22em] uppercase">
                            {t('footer.navigate')}
                        </h3>
                        <ul className="mt-5 space-y-1">
                            {NAV_ITEMS.map((item, i) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => go(item)}
                                        className="text-muted group flex items-center gap-3 py-1.5 text-sm transition-colors hover:text-(--accent)"
                                    >
                                        <span className="force-mono text-[0.68rem] opacity-40 transition-opacity group-hover:opacity-100">
                                            0{i + 1}
                                        </span>
                                        <span className="relative">
                                            {t(`navigation.${item.id}`)}
                                            <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-(--accent) rtl:origin-right transition-transform duration-300 group-hover:scale-x-100" />
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Colophon */}
                    <div className="reveal" data-delay="160">
                        <h3 className="text-muted font-mono text-[0.66rem] tracking-[0.22em] uppercase">
                            {t('footer.colophon')}
                        </h3>
                        <ul className="mt-5 flex flex-wrap gap-2">
                            {STACK.map(({ label, href }) => (
                                <li key={label}>
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="chip force-mono transition-colors duration-300 hover:border-(--line-strong) hover:text-(--accent)"
                                    >
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <hr className="hairline" />

                {/* ---------------- bottom bar ---------------- */}
                <div className="flex flex-col-reverse items-center justify-between gap-5 py-7 text-center sm:flex-row sm:text-start">
                    <p className="text-muted font-mono text-[0.7rem] tracking-[0.14em]">
                        <span className="force-mono">
                            © {new Date().getFullYear()}
                        </span>{' '}
                        {userName} — {t('footer.rights')}
                    </p>

                    <div className="flex items-center gap-4">
                        <p className="text-muted hidden items-center gap-1.5 font-mono text-[0.7rem] tracking-[0.14em] md:inline-flex">
                            {t('footer.madeWith')}
                            <IconHeartFilled
                                size={12}
                                className="text-accent animate-pulse"
                            />
                        </p>
                        <button
                            onClick={scrollToTop}
                            className="icon-btn group h-9 gap-2 px-4 font-mono text-[0.66rem] tracking-[0.18em] uppercase"
                            aria-label={t('footer.backToTop')}
                        >
                            {t('footer.backToTop')}
                            {/* the arrow launches out of the top while a second
                                one rises in behind it */}
                            <span className="relative block h-3.5 w-3.5 overflow-hidden">
                                <IconArrowUp
                                    size={14}
                                    className="absolute inset-0 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full"
                                />
                                <IconArrowUp
                                    size={14}
                                    className="absolute inset-0 translate-y-full transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                                />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};
