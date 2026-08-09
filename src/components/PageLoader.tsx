import { useTranslation } from 'react-i18next';

/** The spinner shared by the route-level Suspense boundary and the data fetch. */
export const PageLoader = () => {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6">
            <div className="relative h-20 w-20">
                <span className="absolute inset-0 rounded-full border border-(--line)" />
                <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-(--accent)" />
                <span className="absolute inset-3 rounded-full bg-(--accent) opacity-20 blur-md" />
            </div>
            <p className="text-muted font-mono text-[0.7rem] tracking-[0.3em] uppercase">
                {t('loading.loading')}
            </p>
        </div>
    );
};
