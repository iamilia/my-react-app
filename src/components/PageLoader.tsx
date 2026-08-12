import { useTranslation } from 'react-i18next';

/** The indicator shared by the route-level Suspense boundary and the data fetch. */
export const PageLoader = () => {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-svh items-center justify-center px-6">
            <div className="w-full max-w-xs">
                <span className="label">{t('loading.loading')}</span>
                <div className="loader-track mt-3">
                    <span className="loader-bar" />
                </div>
            </div>
        </div>
    );
};
