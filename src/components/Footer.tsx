import { IconArrowUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNumbers } from '../hooks/useNumbers';
import { smoothScrollToTop } from '../utils/scroll';

interface FooterProps {
    userName: string;
    /** Only supplied by the home page, where the sections actually exist. */
    scrollToSection?: (sectionId: string) => void;
}

const SECTIONS = ['work', 'projects', 'about', 'skills', 'contact'] as const;

const NAV_ITEMS = [
    ...SECTIONS.map((id) => ({ id, to: `/#${id}` })),
    { id: 'games', to: '/game' },
    { id: 'metro', to: '/metro' },
] as const;

const STACK = [
    { label: 'React', href: 'https://react.dev' },
    { label: 'TypeScript', href: 'https://www.typescriptlang.org' },
    { label: 'Tailwind CSS', href: 'https://tailwindcss.com' },
    { label: 'Vite', href: 'https://vite.dev' },
];

/**
 * The foot of the page. It holds the site map, the colophon and the copyright line.
 */
export const Footer = ({ userName, scrollToSection }: FooterProps) => {
    const { t } = useTranslation();
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
        const isSection = item.id !== 'games' && item.id !== 'metro';
        if (isSection && onHome && scrollToSection) {
            scrollToSection(item.id);
            return;
        }
        navigate(item.to);
    };

    return (
        <footer className="section-alt border-t border-(--line)">
            <div className="wrap">
                <div className="field py-10 sm:py-12 lg:py-16">
                    <div className="field-aside">
                        <button
                            type="button"
                            onClick={scrollToTop}
                            className="text-lg font-semibold"
                        >
                            {userName}
                        </button>
                        <p className="prose-sm mt-2 max-w-xs">
                            {t('footer.tagline')}
                        </p>
                        <p className="mt-5 flex items-center gap-2.5">
                            <span className="marker" />
                            <span className="label">{t('hero.available')}</span>
                        </p>
                    </div>

                    <div className="field-body">
                        <div className="grid gap-10 sm:grid-cols-2">
                            <nav aria-label={t('footer.navigate')}>
                                <p className="label label-ink">
                                    {t('footer.navigate')}
                                </p>
                                <ul className="m-0 mt-3 list-none p-0">
                                    {NAV_ITEMS.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                onClick={() => go(item)}
                                                className="link flex min-h-9 items-center text-start text-[0.9375rem]"
                                            >
                                                {t(`navigation.${item.id}`)}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            <div>
                                <p className="label label-ink">
                                    {t('footer.colophon')}
                                </p>
                                <ul className="m-0 mt-3 list-none p-0">
                                    {STACK.map(({ label, href }) => (
                                        <li key={label}>
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link inline-flex min-h-9 items-center text-[0.9375rem]"
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

                <div className="flex flex-col-reverse items-start justify-between gap-2 py-5 sm:flex-row sm:items-center">
                    <p className="text-muted nums text-sm">
                        © {n(new Date().getFullYear(), 'plain')} {userName} —{' '}
                        {t('footer.rights')}
                    </p>

                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="menubar-item invert-on-hover -ms-2.5"
                    >
                        {t('footer.backToTop')}
                        <IconArrowUp size={15} />
                    </button>
                </div>
            </div>
        </footer>
    );
};
