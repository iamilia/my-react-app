import {
    type MotionValue,
    motion,
    useMotionValueEvent,
    useReducedMotion,
} from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import type { Language } from '../types/lang';
import {
    type DayType,
    type Journey,
    type NetworkData,
    type NetworkStation,
    type ScheduledTrain,
    trainsAt,
} from './core';
import { stationNames } from './names';
import {
    journeyBounds,
    routeSpans,
    routeStops,
    scheduledTrainPoint,
    trainAt,
} from './scene/journeyGeometry';
import { curvePoint, lineIndexToT, type Vec3 } from './scene/layout';
import { networkLayout } from './scene/networkLayout';
import type { SceneView } from './useSceneMode';

interface RouteDiagram2DProps {
    network: NetworkData;
    stations: NetworkStation[];
    journey: Journey;
    /** Ride seconds into the journey (journey view). */
    elapsed: MotionValue<number>;
    /** 'network' shows every scheduled train instead of the journey. */
    view: SceneView;
    /** Seconds of day (network view). */
    clock: MotionValue<number>;
    dayType: DayType;
    /** Journey view: trains heading for the rider's platforms, now. */
    liveTrains: ScheduledTrain[];
    language: Language;
    label: string;
}

/** SVG path through a line's curve between two fractional station indices. */
const pathBetween = (points: Vec3[], from: number, to: number) => {
    const steps = Math.max(8, Math.round(Math.abs(to - from) * 12));
    let d = '';
    for (let k = 0; k <= steps; k += 1) {
        const index = from + ((to - from) * k) / steps;
        const [x, , z] = curvePoint(points, lineIndexToT(index, points.length));
        d += `${k === 0 ? 'M' : 'L'}${x.toFixed(3)} ${z.toFixed(3)}`;
    }
    return d;
};

/** Same as in the 3D scene: past this, only ends and changes are labelled. */
const MAX_STOP_LABELS = 16;

/**
 * The lightweight version of the scene: same network layout, same curves,
 * same train position per second — drawn in SVG, with a slight tilt for
 * depth. No `three` in this chunk.
 */
export const RouteDiagram2D = ({
    network,
    stations,
    journey,
    elapsed,
    view,
    clock,
    dayType,
    liveTrains,
    language,
    label,
}: RouteDiagram2DProps) => {
    const showJourney = view === 'journey';
    const fleetRef = useRef<SVGGElement>(null);
    const reduceMotion = useReducedMotion();
    const trainRef = useRef<SVGGElement>(null);
    const bodyRef = useRef<SVGRectElement>(null);
    const layout = networkLayout(network);
    const colors = useMemo(
        () => new Map(network.lines.map((l) => [l.id, l.color])),
        [network]
    );

    const fullPaths = useMemo(
        () =>
            network.lines.map((line) => {
                const points = layout.lines.get(line.id) ?? [];
                return {
                    id: line.id,
                    color: line.color,
                    d: pathBetween(points, 0, points.length - 1),
                };
            }),
        [network, layout]
    );

    const stops = showJourney ? routeStops(journey) : [];
    const onRoute = new Set(stops.map((s) => s.stationId));
    const byId = new Map(stations.map((s) => [s.id, s]));

    // "Camera": the viewBox eases onto the route, or the whole network.
    const { minX, maxX, minZ, maxZ } = layout.bounds;
    const bounds = showJourney
        ? journeyBounds(layout, journey)
        : {
              center: [(minX + maxX) / 2, 0, (minZ + maxZ) / 2] as Vec3,
              width: maxX - minX,
              depth: maxZ - minZ,
          };
    const width = Math.max(bounds.width + (showJourney ? 6 : 2), 9);
    const height = Math.max(bounds.depth + (showJourney ? 5 : 2), width * 0.5);
    const viewBox = `${bounds.center[0] - width / 2} ${bounds.center[2] - height / 2} ${width} ${height}`;
    const fontSize = Math.max(width * 0.026, 0.3);

    const paintTrain = (seconds: number) => {
        const g = trainRef.current;
        if (!g) return;
        const train = trainAt(layout, journey, seconds);
        const [x, , z] = train.point;
        const angle =
            (Math.atan2(train.heading[2], train.heading[0]) * 180) / Math.PI;
        g.setAttribute(
            'transform',
            `translate(${x.toFixed(3)} ${z.toFixed(3)}) rotate(${angle.toFixed(2)})`
        );
        bodyRef.current?.setAttribute(
            'fill',
            colors.get(train.lineId) ?? 'var(--fg)'
        );
    };

    /**
     * Every scheduled train, as a pool of <rect>s reused frame to frame —
     * creating ~130 React elements per frame would be the slow way.
     */
    const paintFleet = (trains: ScheduledTrain[]) => {
        const g = fleetRef.current;
        if (!g) return;
        while (g.childElementCount < trains.length) {
            const rect = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'rect'
            );
            rect.setAttribute('x', '-0.3');
            rect.setAttribute('y', '-0.11');
            rect.setAttribute('width', '0.6');
            rect.setAttribute('height', '0.22');
            rect.setAttribute('rx', '0.08');
            rect.setAttribute('stroke', 'var(--bg)');
            rect.setAttribute('stroke-width', '0.04');
            g.appendChild(rect);
        }
        Array.from(g.children).forEach((el, i) => {
            const train = trains[i];
            if (!train) {
                el.setAttribute('visibility', 'hidden');
                return;
            }
            const { point, heading } = scheduledTrainPoint(layout, train, 0.16);
            const angle = (Math.atan2(heading[2], heading[0]) * 180) / Math.PI;
            el.setAttribute('visibility', 'visible');
            el.setAttribute('fill', colors.get(train.lineId) ?? 'var(--fg)');
            el.setAttribute(
                'transform',
                `translate(${point[0].toFixed(3)} ${point[2].toFixed(3)}) rotate(${angle.toFixed(1)})`
            );
        });
    };

    useMotionValueEvent(clock, 'change', (v) => {
        if (!showJourney) paintFleet(trainsAt(network, dayType, v));
    });
    // biome-ignore lint/correctness/useExhaustiveDependencies: paintFleet closes over layout/colors, which are the real inputs
    useEffect(() => {
        paintFleet(
            showJourney ? liveTrains : trainsAt(network, dayType, clock.get())
        );
    }, [showJourney, liveTrains, network, layout, dayType, clock]);

    useMotionValueEvent(elapsed, 'change', paintTrain);
    // biome-ignore lint/correctness/useExhaustiveDependencies: paintTrain closes over journey/layout, which are the real inputs
    useEffect(() => paintTrain(elapsed.get()), [journey, layout, elapsed]);

    return (
        <div
            className="relative h-full w-full overflow-hidden"
            style={{ perspective: '900px' }}
        >
            <motion.svg
                role="img"
                aria-label={label}
                className="h-full w-full"
                style={{
                    transform: 'rotateX(22deg)',
                    transformOrigin: '50% 60%',
                }}
                preserveAspectRatio="xMidYMid meet"
                initial={false}
                animate={{ viewBox }}
                transition={
                    reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
                }
            >
                <defs>
                    <filter
                        id="metro-glow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        <feGaussianBlur stdDeviation="0.12" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {fullPaths.map((p) => (
                    <path
                        key={p.id}
                        d={p.d}
                        fill="none"
                        stroke={p.color}
                        strokeOpacity={0.3}
                        strokeWidth={0.1}
                        strokeLinecap="round"
                    />
                ))}

                {(showJourney ? routeSpans(journey) : []).map((span) => (
                    <path
                        key={`${span.lineId}-${span.lo}-${span.hi}`}
                        d={pathBetween(
                            layout.lines.get(span.lineId) ?? [],
                            span.lo,
                            span.hi
                        )}
                        fill="none"
                        stroke={colors.get(span.lineId)}
                        strokeWidth={0.22}
                        strokeLinecap="round"
                        filter="url(#metro-glow)"
                    />
                ))}

                {stations.map((station) => {
                    if (onRoute.has(station.id)) return null;
                    const p = layout.stations.get(station.id);
                    if (!p) return null;
                    const isInterchange = station.lineIds.length > 1;
                    return (
                        <circle
                            key={station.id}
                            cx={p[0]}
                            cy={p[2]}
                            r={isInterchange ? 0.12 : 0.06}
                            fill={
                                isInterchange
                                    ? 'var(--fg)'
                                    : 'var(--line-strong)'
                            }
                        />
                    );
                })}

                {stops.map((stop, i) => {
                    const station = byId.get(stop.stationId);
                    const p = layout.stations.get(stop.stationId);
                    if (!station || !p) return null;
                    const isEnd =
                        stop.role === 'origin' || stop.role === 'destination';
                    const isMajor = isEnd || stop.role === 'transfer';
                    const color = colors.get(stop.lineId);
                    const above = i % 2 === 0;
                    return (
                        <g key={stop.stationId}>
                            <circle
                                cx={p[0]}
                                cy={p[2]}
                                r={isMajor ? 0.26 : 0.15}
                                fill="var(--bg)"
                                stroke={isMajor ? 'var(--fg)' : color}
                                strokeWidth={isMajor ? 0.09 : 0.06}
                                filter={isEnd ? 'url(#metro-glow)' : undefined}
                            />
                            {(isMajor || stops.length <= MAX_STOP_LABELS) && (
                                <text
                                    x={p[0]}
                                    y={p[2] + (above ? -0.5 : 0.8)}
                                    textAnchor="middle"
                                    fontSize={
                                        isEnd
                                            ? fontSize * 1.15
                                            : isMajor
                                              ? fontSize
                                              : fontSize * 0.78
                                    }
                                    fontWeight={isMajor ? 700 : 500}
                                    fill={
                                        isMajor
                                            ? 'var(--fg)'
                                            : 'var(--fg-muted)'
                                    }
                                    paintOrder="stroke"
                                    stroke="var(--bg)"
                                    strokeWidth={fontSize * 0.25}
                                    direction={
                                        language === 'fa' ? 'rtl' : 'ltr'
                                    }
                                    // The page's px letter/word spacing would
                                    // crush words at this viewBox scale.
                                    style={{ letterSpacing: 0, wordSpacing: 0 }}
                                >
                                    {stationNames(station, language).primary}
                                </text>
                            )}
                        </g>
                    );
                })}

                <g ref={fleetRef} />

                {/* The train, drawn pointing along +x and rotated onto the
                    curve's tangent every frame. */}
                <g
                    ref={trainRef}
                    visibility={showJourney ? 'visible' : 'hidden'}
                >
                    <rect
                        ref={bodyRef}
                        x={-0.5}
                        y={-0.17}
                        width={1}
                        height={0.34}
                        rx={0.12}
                        stroke="var(--fg)"
                        strokeWidth={0.03}
                    />
                    <rect
                        x={-0.36}
                        y={-0.07}
                        width={0.72}
                        height={0.14}
                        rx={0.05}
                        fill="var(--bg)"
                        opacity={0.85}
                    />
                    <circle cx={0.45} cy={0} r={0.06} fill="#fffbe6" />
                </g>
            </motion.svg>
        </div>
    );
};
