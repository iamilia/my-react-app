import type { Language } from '../types/lang';
import type { Station } from './core';

/**
 * Station name in the reading language, with the other script as a secondary
 * line. English names can be missing (`null`) for lines that haven't been
 * transliterated yet — the Persian name stands in.
 */
export const stationNames = (station: Station, language: Language) => {
    if (language === 'fa' || station.en === null) {
        return { primary: station.fa, secondary: station.en };
    }
    return { primary: station.en, secondary: station.fa };
};
