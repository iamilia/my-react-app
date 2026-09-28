import { IconChevronDown } from '@tabler/icons-react';
import { useId } from 'react';
import type { Language } from '../types/lang';
import type { LineData, NetworkStation } from './core';
import { stationNames } from './names';
import { SELECT_FIELD, SELECT_OPTION } from './styles';

interface StationPickerProps {
    label: string;
    lines: readonly LineData[];
    /** Network-wide station list, used for the secondary line. */
    stations: NetworkStation[];
    value: string;
    onChange: (stationId: string) => void;
    language: Language;
    /** Station id to mark as unavailable (the other end of the ride). */
    disabledId?: string;
}

/**
 * A native <select>: on a phone it opens the system picker, it is keyboard-
 * and screen-reader-complete for free, and it copes with 150 stations. They
 * are grouped by line, so interchanges appear under each line they serve.
 */
export const StationPicker = ({
    label,
    lines,
    stations,
    value,
    onChange,
    language,
    disabledId,
}: StationPickerProps) => {
    const id = useId();
    const selected = stations.find((s) => s.id === value);
    const names = selected ? stationNames(selected, language) : null;
    const lineNames = selected?.lineIds
        .map((lineId) => lines.find((l) => l.id === lineId)?.name[language])
        .filter(Boolean)
        .join(language === 'fa' ? '، ' : ' · ');

    return (
        <div className="min-w-0">
            <label htmlFor={id} className="label">
                {label}
            </label>
            <div className="relative mt-2">
                <select
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={SELECT_FIELD}
                >
                    {lines.map((line) => (
                        <optgroup
                            key={line.id}
                            label={line.name[language]}
                            className={SELECT_OPTION}
                        >
                            {line.stations.map((station) => (
                                <option
                                    key={station.id}
                                    value={station.id}
                                    disabled={station.id === disabledId}
                                    className={SELECT_OPTION}
                                >
                                    {stationNames(station, language).primary}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                <IconChevronDown
                    size={16}
                    aria-hidden
                    className="text-muted pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2"
                />
            </div>
            <p className="text-muted mt-1.5 flex min-w-0 gap-2 ps-1 text-xs">
                {names?.secondary && (
                    <span
                        className="truncate"
                        dir="auto"
                        lang={language === 'fa' ? 'en' : 'fa'}
                    >
                        {names.secondary}
                    </span>
                )}
                {lineNames && <span className="shrink-0">({lineNames})</span>}
            </p>
        </div>
    );
};
