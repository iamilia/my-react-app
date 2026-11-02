import { IconArrowLeft } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { type ReactNode, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../store/languageStore';
import { useThemeStore } from '../store/themeStore';
import { Footer } from './Footer';
import { EASE_OUT, SplitText } from './Motion';
import { Navigation } from './Navigation';
import { RouteLine } from './RouteLine';
import { SectionHeading } from './SectionHeading';

interface SubPageShellProps {
    /** The page's name, set as the poster title. */
    title: string;
    subtitle?: string;
    /** A link back up the site (e.g. 2048 → all games). */
    back?: { to: string; label: string };
    /** Small label above the title when there is no back link. */
    kicker?: string;
    /** Sits beside the title on wide screens: a score, a range picker. */
    aside?: ReactNode;
    /** Stations: `<Station>` sections. */
    children: ReactNode;
}

/**
 * Every page that isn't the one-pager runs on the same line as the home page:
 * the title as a smaller poster, the ring the line starts at, and then the
 * page's own sections as stations down the rail.
 */
export const SubPageShell = ({
    title,
    subtitle,
    back,
    kicker,
    aside,
    children,
}: SubPageShellProps) => {
    const darkMode = useThemeStore((s) => s.darkMode);
    const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);
    const language = useLanguageStore((s) => s.language);
    const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);
    const { t, i18n } = useTranslation();
    const reduce = useReducedMotion();
    const mainRef = useRef<HTMLElement>(null);

    const fadeUp = (delay: number) => ({
        initial: reduce ? false : { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: EASE_OUT, delay },
    });

    return (
        <>
            <Navigation
                userName={t('navigation.userName')}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                toggleLanguage={toggleLanguage}
                language={language}
            />

            <main ref={mainRef} className="relative">
                <RouteLine container={mainRef} />

                <header className="pt-28 md:pt-32 xl:pt-36">
                    <div className="wrap">
                        <motion.div {...fadeUp(0.05)}>
                            {back ? (
                                <Link
                                    to={back.to}
                                    className="label group inline-flex min-h-11 items-center gap-2 transition-colors hover:text-(--fg)"
                                >
                                    <IconArrowLeft
                                        size={15}
                                        className="transition-transform duration-300 group-hover:-translate-x-1 rtl:-scale-x-100 rtl:group-hover:translate-x-1"
                                    />
                                    {back.label}
                                </Link>
                            ) : (
                                kicker && (
                                    <p className="label inline-flex min-h-11 items-center">
                                        {kicker}
                                    </p>
                                )
                            )}
                        </motion.div>

                        <div className="mt-4 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
                            <h1
                                className={`poster-sm ${title.length > 12 ? 'poster-long lg:col-span-8' : 'lg:col-span-7'}`}
                                key={i18n.language}
                            >
                                <SplitText text={title} immediate delay={0.1} />
                            </h1>
                            {(subtitle || aside) && (
                                <motion.div
                                    className={
                                        title.length > 12
                                            ? 'lg:col-span-4'
                                            : 'lg:col-span-5'
                                    }
                                    {...fadeUp(0.4)}
                                >
                                    {subtitle && (
                                        <p className="lede">{subtitle}</p>
                                    )}
                                    {aside && (
                                        <div className={subtitle ? 'mt-6' : ''}>
                                            {aside}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* The ring the line starts at. */}
                        <div
                            className="mt-12 flex justify-end md:mt-16"
                            aria-hidden="true"
                        >
                            <span data-route-start className="size-0" />
                        </div>
                    </div>
                </header>

                {children}
            </main>

            <Footer userName={t('navigation.userName')} />
        </>
    );
};

interface StationProps {
    no: number;
    title: string;
    subtitle?: string;
    children: ReactNode;
    /** Extra classes on the section (e.g. a larger bottom pad on the last). */
    className?: string;
}

/** One stop on a sub-page's line: a station heading and its content. */
export const Station = ({
    no,
    title,
    subtitle,
    children,
    className = '',
}: StationProps) => (
    <section className={`py-14 md:py-20 ${className}`}>
        <div className="wrap">
            <div className="lined">
                <SectionHeading
                    no={no}
                    title={title}
                    subtitle={subtitle}
                    size="md"
                />
                {children}
            </div>
        </div>
    </section>
);
