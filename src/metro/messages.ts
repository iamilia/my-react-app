import type { TFunction } from 'i18next';
import type { Language } from '../types/lang';
import { localiseNumber } from '../utils/number';
import { formatClock, type MetroError, type NetworkStation } from './core';
import { stationNames } from './names';

/** Minutes with at most one decimal, in the reading language's digits. */
export const formatMinutes = (seconds: number, language: Language) =>
    localiseNumber(Math.round((seconds / 60) * 10) / 10, language);

/** "HH:MM" in the reading language's digits. */
export const formatClockLocalised = (seconds: number, language: Language) =>
    formatClock(seconds).replace(/\d/g, (d) =>
        localiseNumber(Number(d), language, 'plain')
    );

/** Human sentence for every error the core can return. */
export const errorMessage = (
    error: MetroError,
    t: TFunction,
    name: (stationId: string) => string,
    language: Language
): string => {
    switch (error.code) {
        case 'MISSING_SEGMENT_TIME':
            return t('metro.errors.MISSING_SEGMENT_TIME', {
                a: name(error.between[0]),
                b: name(error.between[1]),
            });
        case 'OUT_OF_SERVICE':
            return t('metro.errors.OUT_OF_SERVICE', {
                first: formatClockLocalised(error.firstAtStation, language),
                last: formatClockLocalised(error.lastAtStation, language),
            });
        case 'NO_ROUTE':
            return t('metro.errors.NO_ROUTE', {
                from: name(error.from),
                to: name(error.to),
            });
        case 'UNKNOWN_STATION':
            return t('metro.errors.UNKNOWN_STATION', { id: error.stationId });
        default:
            return t(`metro.errors.${error.code}`);
    }
};

/** Station id → its name in the reading language. */
export const stationNamer =
    (stations: NetworkStation[], language: Language) => (id: string) => {
        const station = stations.find((s) => s.id === id);
        return station ? stationNames(station, language).primary : id;
    };
