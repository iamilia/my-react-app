import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { localiseNumber, type NumberStyle } from '../utils/number';

/**
 * Formats a number in whatever language the page is currently reading in.
 * Rebuilds only when the language changes, so it is safe to call in render.
 */
export const useNumbers = () => {
    const { i18n } = useTranslation();
    const { language } = i18n;

    return useCallback(
        (value: number | null | undefined, style: NumberStyle = 'count') =>
            localiseNumber(value, language, style),
        [language]
    );
};
