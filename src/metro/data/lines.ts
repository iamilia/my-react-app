import {
    type LineData,
    type NetworkData,
    parseLineData,
    parseTransfers,
} from '../core';
import line1 from './line-1.json';
import line2 from './line-2.json';
import line3 from './line-3.json';
import line4 from './line-4.json';
import line5 from './line-5.json';
import line6 from './line-6.json';
import line7 from './line-7.json';
import transfers from './transfers.json';

const fail = (what: string, path: string, message: string): never => {
    throw new Error(`Invalid metro ${what} at ${path}: ${message}`);
};

const load = (json: unknown): LineData => {
    const parsed = parseLineData(json);
    return parsed.ok
        ? parsed.value
        : fail('line data', parsed.error.path, parsed.error.message);
};

/**
 * Every line the page offers. Adding one = generate its JSON with
 * scripts/metro/extract_timetable.py, add it here, and add any new
 * interchanges to transfers.json.
 */
export const LINES: readonly LineData[] = [
    line1,
    line2,
    line3,
    line4,
    line5,
    line6,
    line7,
].map(load);

const parsedTransfers = parseTransfers(transfers);

export const NETWORK: NetworkData = {
    lines: [...LINES],
    transfers: parsedTransfers.ok
        ? parsedTransfers.value
        : fail(
              'transfers',
              parsedTransfers.error.path,
              parsedTransfers.error.message
          ),
};

export const DEFAULT_ROUTE = {
    from: 'shahid-kolahdooz',
    to: 'meydan-e-enghelab',
} as const;
