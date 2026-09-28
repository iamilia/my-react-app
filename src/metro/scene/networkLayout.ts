/**
 * Schematic positions for every station on the network, shared by the 3D
 * scene and the SVG fallback.
 *
 * Only terminals, interchanges and a few bends get a hand-placed anchor —
 * rough positions in km east / north of central Tehran, compressed at the
 * far ends (Karaj, Kahrizak) so the map fits a screen. Everything else is
 * spaced evenly between anchors along its line, then a short relaxation
 * evens out spacing and pushes crowded stations apart.
 *
 * This is a diagram, not a map, and it feeds no timing: every minute on the
 * page comes from the timetables.
 */

import type { NetworkData } from '../core';
import type { Vec3 } from './layout';

type XY = [number, number];

/** Rough anchor positions, km (x east, y north). Visual only. */
const ANCHORS: Record<string, XY> = {
    // terminals
    tajrish: [1.5, 11.5],
    kahrizak: [-1, -15],
    sadeghieh: [-8, 2.2],
    farhangsara: [12, 3],
    azadegan: [-5, -9],
    ghaem: [10, 10],
    'shahid-kolahdooz': [11, -0.5],
    'allameh-jafari': [-13, 3.4],
    golshahr: [-24, 4.5],
    'shahid-arman': [-9, 10],
    dowlatabad: [4, -7],
    'meydan-e-ketab': [-7, 8],
    'takhti-stadium': [6, -4.5],
    // interchanges
    'darvazeh-dowlat': [1.5, 0.8],
    'emam-khomeini': [0.8, -1],
    'shahid-beheshti': [1.2, 3.8],
    'haft-e-tir': [1.3, 2.2],
    'meydan-e-mohammadieh': [-0.2, -3.2],
    shademan: [-4.2, 1.2],
    'darvazeh-shemiran': [3.2, 0],
    'emam-hossein': [4.3, 0.6],
    'navvab-safavi': [-3, 0],
    'teatr-e-shahr': [-0.4, 0.9],
    'meydan-e-valiasr': [0, 2.4],
    mahdieh: [-1, -2.6],
    'meydan-e-shohada': [4.5, -0.4],
    towhid: [-2.6, 1.1],
    'eram-e-sabz': [-10, 2.8],
    'tarbiat-modares': [-3, 4.2],
    // bends
    mirdamad: [1.5, 6.5],
    shoush: [-0.3, -4.6],
    'shahr-e-rey': [-0.8, -9.5],
    'rah-ahan': [-1.8, -2],
    'meydan-e-azadi': [-6.8, 1.2],
    'shahr-e-ziba': [-8, 7],
    'meydan-e-khorasan': [4.5, -3],
    'borj-e-milad': [-4.5, 6],
    mowlavi: [1, -3.6],
};

/** Scene units per km. */
const SCALE = 1.25;
const ITERATIONS = 160;
/** Radius (km) that the fisheye leaves unchanged. */
const FISHEYE_R0 = 6;

export interface NetworkLayout {
    /** Position of every station (x east, z south — three's convention). */
    stations: Map<string, Vec3>;
    /** Each line's stations in order, ready for `curvePoint`. */
    lines: Map<string, Vec3[]>;
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

const cache = new WeakMap<NetworkData, NetworkLayout>();

export const networkLayout = (network: NetworkData): NetworkLayout => {
    const cached = cache.get(network);
    if (cached) return cached;

    // 1. Seed: anchors where given, even spacing between them otherwise.
    const seeds = new Map<string, XY[]>();
    for (const line of network.lines) {
        const ids = line.stations.map((s) => s.id);
        const anchored = ids
            .map((id, i) => [i, ANCHORS[id]] as const)
            .filter((a): a is readonly [number, XY] => Boolean(a[1]));
        if (anchored.length < 2) {
            throw new Error(`line ${line.id} needs anchors at both ends`);
        }
        ids.forEach((id, i) => {
            const after = anchored.find(([j]) => j >= i) ?? anchored.at(-1);
            const before =
                [...anchored].reverse().find(([j]) => j <= i) ?? anchored[0];
            if (!after || !before) return;
            const [ia, a] = before;
            const [ib, b] = after;
            const f = ib === ia ? 0 : (i - ia) / (ib - ia);
            const p: XY = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
            seeds.set(id, [...(seeds.get(id) ?? []), p]);
        });
    }

    const ids = [...seeds.keys()];
    const index = new Map(ids.map((id, i) => [id, i]));
    const pos: XY[] = ids.map((id) => {
        const list = seeds.get(id) ?? [];
        return [
            list.reduce((s, p) => s + p[0], 0) / list.length,
            list.reduce((s, p) => s + p[1], 0) / list.length,
        ];
    });

    const edges: [number, number][] = [];
    const triples: [number, number, number][] = [];
    for (const line of network.lines) {
        const idx = line.stations.map((s) => index.get(s.id) ?? 0);
        for (let i = 0; i + 1 < idx.length; i += 1) {
            edges.push([idx[i], idx[i + 1]]);
        }
        for (let i = 1; i + 1 < idx.length; i += 1) {
            triples.push([idx[i - 1], idx[i], idx[i + 1]]);
        }
    }

    const lengths = edges
        .map(([a, b]) =>
            Math.hypot(pos[a][0] - pos[b][0], pos[a][1] - pos[b][1])
        )
        .sort((x, y) => x - y);
    const rest = lengths[Math.floor(lengths.length / 2)];
    const min = rest * 0.75;
    const minSq = min * min;

    // 2. Relax: springs, straightening, anchor pull, short-range repulsion.
    for (let it = 0; it < ITERATIONS; it += 1) {
        const cool = 1 - it / ITERATIONS;
        const move: XY[] = pos.map(() => [0, 0]);

        for (const [a, b] of edges) {
            const dx = pos[b][0] - pos[a][0];
            const dy = pos[b][1] - pos[a][1];
            const d = Math.hypot(dx, dy) || 1e-6;
            const f = ((d - rest) / d) * 0.25;
            move[a][0] += dx * f;
            move[a][1] += dy * f;
            move[b][0] -= dx * f;
            move[b][1] -= dy * f;
        }
        for (const [a, m, b] of triples) {
            move[m][0] += ((pos[a][0] + pos[b][0]) / 2 - pos[m][0]) * 0.12;
            move[m][1] += ((pos[a][1] + pos[b][1]) / 2 - pos[m][1]) * 0.12;
        }
        for (let i = 0; i < pos.length; i += 1) {
            const anchor = ANCHORS[ids[i]];
            if (anchor) {
                move[i][0] += (anchor[0] - pos[i][0]) * 0.2;
                move[i][1] += (anchor[1] - pos[i][1]) * 0.2;
            }
            for (let j = i + 1; j < pos.length; j += 1) {
                const dx = pos[j][0] - pos[i][0];
                const dy = pos[j][1] - pos[i][1];
                const d2 = dx * dx + dy * dy;
                if (d2 >= minSq) continue;
                const d = Math.sqrt(d2) || 1e-6;
                const f = ((min - d) / d) * 0.3;
                move[i][0] -= dx * f;
                move[i][1] -= dy * f;
                move[j][0] += dx * f;
                move[j][1] += dy * f;
            }
        }
        for (let i = 0; i < pos.length; i += 1) {
            pos[i][0] += move[i][0] * (0.3 + 0.7 * cool);
            pos[i][1] += move[i][1] * (0.3 + 0.7 * cool);
        }
    }

    // 3. Fisheye: the centre is where lines meet and stations crowd, the
    //    arms are long and sparse. Growing distances as r^0.78 instead of r
    //    gives the middle room without losing the overall shape.
    // 4. To scene units: x east, z = −north (three's camera looks down −z).
    const stations = new Map<string, Vec3>(
        ids.map((id, i) => {
            const [x, y] = pos[i];
            const r = Math.hypot(x, y);
            const k = r > 0 ? (FISHEYE_R0 * (r / FISHEYE_R0) ** 0.78) / r : 1;
            return [id, [x * k * SCALE, 0, -y * k * SCALE]];
        })
    );
    const lines = new Map<string, Vec3[]>(
        network.lines.map((line) => [
            line.id,
            line.stations.map((s): Vec3 => stations.get(s.id) ?? [0, 0, 0]),
        ])
    );
    const xs = [...stations.values()].map((p) => p[0]);
    const zs = [...stations.values()].map((p) => p[2]);

    const layout: NetworkLayout = {
        stations,
        lines,
        bounds: {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minZ: Math.min(...zs),
            maxZ: Math.max(...zs),
        },
    };
    cache.set(network, layout);
    return layout;
};
