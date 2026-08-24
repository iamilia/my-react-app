import { IconArrowUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';
import { useNumbers } from '../hooks/useNumbers';
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
    const n = useNumbers();
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
        <footer ref={ref} className="section-alt">
            <div className="wrap">
                <div className="field py-12 sm:py-14 lg:py-20">
                    {/* colophon in the margin, index in the field */}
                    <div className="field-aside reveal">
                        <button
                            type="button"
                            onClick={scrollToTop}
                            className="display text-3xl transition-colors hover:text-(--accent)"
                        >
                            {userName}
                        </button>
                        <p className="prose-sm mt-3 max-w-xs">
                            {t('footer.tagline')}
                        </p>
                        <p className="mt-6 flex items-center gap-2.5">
                            <span className="marker" />
                            <span className="label label-ink">
                                {t('hero.available')}
                            </span>
                        </p>
                    </div>

                    <div className="field-body">
                        <div className="grid gap-12 sm:grid-cols-2">
                            <nav className="reveal" data-delay="60">
                                <p className="label">{t('footer.navigate')}</p>
                                <ul className="m-0 mt-4 list-none p-0">
                                    {NAV_ITEMS.map((item, i) => (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                onClick={() => go(item)}
                                                className="text-muted flex min-h-9 w-full items-baseline gap-4 py-1.5 text-start text-[0.9375rem] transition-colors hover:text-(--accent)"
                                            >
                                                <span className="force-mono nums text-[0.6875rem] opacity-50">
                                                    {n(i + 1, 'padded')}
                                                </span>
                                                {t(`navigation.${item.id}`)}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            <div className="reveal" data-delay="120">
                                <p className="label">{t('footer.colophon')}</p>
                                <ul className="m-0 mt-4 list-none p-0">
                                    {STACK.map(({ label, href }) => (
                                        <li key={label}>
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link force-mono inline-block py-1.5 text-sm"
                                                dir="ltr"
                                            >
                                                {label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="rule" />

                <div className="flex flex-col-reverse items-start justify-between gap-3 py-6 sm:flex-row sm:items-center sm:py-7">
                    <p className="text-muted nums text-xs">
                        © {n(new Date().getFullYear(), 'plain')} {userName} —{' '}
                        {t('footer.rights')}
                    </p>

                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="text-muted label inline-flex min-h-11 items-center gap-2 transition-colors hover:text-(--accent)"
                        aria-label={t('footer.backToTop')}
                    >
                        {t('footer.backToTop')}
                        <IconArrowUp size={14} />
                    </button>
                </div>
            </div>
        </footer>
    );
};
