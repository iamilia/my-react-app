import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

/**
 * English is the base language: the site always initialises in `en`, and
 * `useLanguage` switches to Persian straight after mount if that is what the
 * visitor previously chose. Browser language detection is deliberately not
 * wired up — one owner for the current language (the `language` key in
 * localStorage, via useLanguage) keeps `dir`, `lang` and i18n in step and
 * avoids a first paint in a language the visitor never asked for.
 */
i18n.use(Backend)
    .use(initReactI18next)
    .init({
        lng: 'en',
        fallbackLng: 'en',
        supportedLngs: ['en', 'fa'],
        interpolation: {
            // React escapes for us
            escapeValue: false,
        },
    });

export default i18n;
