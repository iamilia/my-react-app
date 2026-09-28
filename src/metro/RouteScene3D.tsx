import { Html } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'motion/react';
import { type RefObject, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
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
    type RouteStop,
    routeSpans,
    routeStops,
    scheduledTrainPoint,
    trainAt,
} from './scene/journeyGeometry';
import { curvePoint, lineIndexToT, type Vec3 } from './scene/layout';
import { type NetworkLayout, networkLayout } from './scene/networkLayout';
import type { SceneView } from './useSceneMode';

/**
 * Loaded on demand (see pages/Metro.tsx) — `three`, R3F and drei only reach
 * the browser once a visitor opens this page on a device that gets the 3D
 * view.
 */

interface RouteScene3DProps {
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
    dark: boolean;
    language: Language;
    label: string;
}

/** The shared schematic curve, exposed to three (optionally a sub-range). */
class SchematicCurve extends THREE.Curve<THREE.Vector3> {
    private readonly points: Vec3[];
    private readonly t0: number;
    private readonly t1: number;

    constructor(points: Vec3[], t0 = 0, t1 = 1) {
        super();
        this.points = points;
        this.t0 = t0;
        this.t1 = t1;
    }

    override getPoint(t: number, target = new THREE.Vector3()) {
        const [x, y, z] = curvePoint(
            this.points,
            this.t0 + (this.t1 - this.t0) * t
        );
        return target.set(x, y, z);
    }
}

let glowTexture: THREE.Texture | null = null;
/** Soft radial dot, built once — the halo behind every lit station. */
const getGlowTexture = () => {
    if (glowTexture) return glowTexture;
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const g = ctx.createRadialGradient(
            size / 2,
            size / 2,
            0,
            size / 2,
            size / 2,
            size / 2
        );
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
    }
    glowTexture = new THREE.CanvasTexture(canvas);
    return glowTexture;
};

/* --------------------------------- camera --------------------------------- */

const CameraRig = ({
    center,
    span,
    labelled,
}: {
    center: Vec3;
    span: number[];
    /** End labels need side room; the every-train view has none. */
    labelled: boolean;
}) => {
    const { camera, size } = useThree();
    const look = useRef(new THREE.Vector3(0, 0, 0));
    const desired = useRef(new THREE.Vector3());

    useFrame((_, delta) => {
        const cam = camera as THREE.PerspectiveCamera;
        const aspect = size.width / Math.max(size.height, 1);
        const vfov = THREE.MathUtils.degToRad(cam.fov);
        const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
        const [width, depth] = span;
        // Room for the end labels, which are centred on the end stations and
        // take a bigger share of a narrow (phone) viewport.
        const padX = !labelled ? 1 : aspect < 1.3 ? 8 : 3;
        const fit = Math.max(
            (width + padX) / 2 / Math.tan(hfov / 2),
            // The camera looks down at ~38°, so depth shows at ~0.62×.
            (depth * 0.62 + 3) / 2 / Math.tan(vfov / 2)
        );
        const distance = THREE.MathUtils.clamp(fit, 7, 90);

        desired.current.set(
            center[0],
            distance * 0.62,
            center[2] + distance * 0.78
        );
        const dt = Math.min(delta, 0.1);
        const damp = THREE.MathUtils.damp;
        cam.position.x = damp(cam.position.x, desired.current.x, 2.2, dt);
        cam.position.y = damp(cam.position.y, desired.current.y, 2.2, dt);
        cam.position.z = damp(cam.position.z, desired.current.z, 2.2, dt);
        look.current.x = damp(look.current.x, center[0], 2.6, dt);
        look.current.z = damp(look.current.z, center[2], 2.6, dt);
        cam.lookAt(look.current);
    });

    return null;
};

/* ---------------------------------- lines --------------------------------- */

const LineTube = ({
    points,
    from = 0,
    to = points.length - 1,
    color,
    lit,
    dark,
}: {
    points: Vec3[];
    from?: number;
    to?: number;
    color: string;
    lit: boolean;
    dark: boolean;
}) => {
    const curve = useMemo(
        () =>
            new SchematicCurve(
                points,
                lineIndexToT(from, points.length),
                lineIndexToT(to, points.length)
            ),
        [points, from, to]
    );
    const segments = Math.max(24, (to - from) * 16);

    return (
        <mesh>
            <tubeGeometry
                args={[curve, segments, lit ? 0.11 : 0.07, lit ? 12 : 6, false]}
            />
            {lit ? (
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={dark ? 1.1 : 0.6}
                    toneMapped={false}
                />
            ) : (
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={dark ? 0.5 : 0.55}
                    roughness={0.8}
                />
            )}
        </mesh>
    );
};

/* -------------------------------- stations -------------------------------- */

const RouteMarker = ({
    stop,
    station,
    position,
    color,
    labelBelow,
    dark,
    language,
    labelLayer,
    showLabel,
}: {
    stop: RouteStop;
    station: NetworkStation;
    position: Vec3;
    color: string;
    labelBelow: boolean;
    dark: boolean;
    language: Language;
    labelLayer: RefObject<HTMLDivElement | null>;
    showLabel: boolean;
}) => {
    const halo = useRef<THREE.Sprite>(null);
    const names = stationNames(station, language);
    const isEnd = stop.role === 'origin' || stop.role === 'destination';
    const isMajor = isEnd || stop.role === 'transfer';

    useFrame(({ clock }) => {
        if (!halo.current || !isMajor) return;
        const s = 1.25 + Math.sin(clock.elapsedTime * 2.4) * 0.18;
        halo.current.scale.set(s, s, s);
    });

    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[isMajor ? 0.22 : 0.15, 24, 16]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive={color}
                    emissiveIntensity={isMajor ? 1.6 : 0.9}
                    toneMapped={false}
                />
            </mesh>
            <sprite ref={halo} scale={isMajor ? 1.25 : 0.7}>
                <spriteMaterial
                    map={getGlowTexture()}
                    color={color}
                    transparent
                    opacity={dark ? 0.9 : 0.65}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    toneMapped={false}
                />
            </sprite>
            {(showLabel || isMajor) && (
                <Html
                    // A fixed layer rather than drei's default (the canvas'
                    // parent, resolved at mount): with the default, a label
                    // mounted before R3F connects its events can be moved to
                    // a new element and left empty.
                    portal={labelLayer as RefObject<HTMLElement>}
                    center
                    // Lift/drop along y as well as z: y survives the camera
                    // tilt on screen, z alone gets squashed.
                    position={labelBelow ? [0, -0.45, 1] : [0, 0.65, -0.35]}
                    zIndexRange={[20, 0]}
                    style={{ pointerEvents: 'none' }}
                >
                    <div
                        className={`rounded-full border border-(--line) bg-(--bg) px-2.5 py-0.5 text-center whitespace-nowrap shadow-sm ${
                            isEnd
                                ? 'text-[13px] font-bold text-(--fg)'
                                : isMajor
                                  ? 'text-[11px] font-semibold text-(--fg)'
                                  : 'text-muted hidden px-2! text-[10px] sm:block'
                        }`}
                        dir="auto"
                    >
                        {names.primary}
                        {isEnd && names.secondary && (
                            <span className="text-muted block text-[10px] font-medium">
                                {names.secondary}
                            </span>
                        )}
                    </div>
                </Html>
            )}
        </group>
    );
};

/* ---------------------------------- train --------------------------------- */

const Train = ({
    layout,
    journey,
    elapsed,
    colors,
}: {
    layout: NetworkLayout;
    journey: Journey;
    elapsed: MotionValue<number>;
    colors: Map<string, string>;
}) => {
    const group = useRef<THREE.Group>(null);
    const body = useRef<THREE.MeshStandardMaterial>(null);
    const ahead = useMemo(() => new THREE.Vector3(), []);

    useFrame(() => {
        const g = group.current;
        if (!g) return;
        // Same call the clock and the 2D diagram make — one source of time.
        const train = trainAt(layout, journey, elapsed.get());
        const [x, y, z] = train.point;
        const [dx, dy, dz] = train.heading;
        g.position.set(x, y + 0.24, z);
        ahead.set(x + dx, y + 0.24 + dy, z + dz);
        g.lookAt(ahead);
        // The train takes the colour of the line it is on.
        body.current?.color.set(colors.get(train.lineId) ?? '#ffffff');
    });

    // Built along +z, which is the axis lookAt() points at the target.
    return (
        <group ref={group}>
            <mesh>
                <boxGeometry args={[0.38, 0.32, 1.05]} />
                <meshStandardMaterial
                    ref={body}
                    metalness={0.35}
                    roughness={0.35}
                />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.39, 0.09, 0.86]} />
                <meshStandardMaterial
                    color="#1b1a2e"
                    emissive="#9ad7ff"
                    emissiveIntensity={0.7}
                />
            </mesh>
            <mesh position={[0, -0.03, 0.53]}>
                <boxGeometry args={[0.28, 0.07, 0.02]} />
                <meshBasicMaterial color="#fffbe6" toneMapped={false} />
            </mesh>
            <pointLight
                position={[0, 0.2, 0.9]}
                intensity={3}
                distance={3.5}
                color="#fff3c4"
            />
        </group>
    );
};

/* ----------------------------- all trains --------------------------------- */

/** Comfortably above the busiest moment in the timetables (~130 trains). */
const MAX_TRAINS = 400;

const NetworkTrains = ({
    network,
    layout,
    clock,
    dayType,
    colors,
    trains: fixed,
}: {
    network: NetworkData;
    layout: NetworkLayout;
    clock: MotionValue<number>;
    dayType: DayType;
    colors: Map<string, string>;
    /** Draw these instead of every train at `clock`. */
    trains?: ScheduledTrain[];
}) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);

    // Give the mesh its per-instance colour buffer before the first draw, so
    // the material compiles with instance colours switched on.
    useLayoutEffect(() => {
        const m = mesh.current;
        if (!m) return;
        for (let i = 0; i < MAX_TRAINS; i += 1)
            m.setColorAt(i, color.set('#fff'));
        m.count = 0;
    }, [color]);

    useFrame(() => {
        const m = mesh.current;
        if (!m) return;
        const trains = fixed ?? trainsAt(network, dayType, clock.get());
        const n = Math.min(trains.length, MAX_TRAINS);
        for (let i = 0; i < n; i += 1) {
            const train = trains[i];
            const { point, heading } = scheduledTrainPoint(layout, train);
            dummy.position.set(point[0], point[1] + 0.16, point[2]);
            dummy.lookAt(
                point[0] + heading[0],
                point[1] + 0.16,
                point[2] + heading[2]
            );
            dummy.updateMatrix();
            m.setMatrixAt(i, dummy.matrix);
            m.setColorAt(i, color.set(colors.get(train.lineId) ?? '#ffffff'));
        }
        m.count = n;
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={mesh}
            args={[undefined, undefined, MAX_TRAINS]}
            frustumCulled={false}
        >
            <boxGeometry args={[0.24, 0.2, 0.62]} />
            {/* Unlit, so each train shows its line colour at full strength
                whatever the lighting. */}
            <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
    );
};

/* ---------------------------------- scene --------------------------------- */

/** Beyond this many stops, only the ends and changes get a label. */
const MAX_STOP_LABELS = 16;

export const RouteScene3D = ({
    network,
    stations,
    journey,
    elapsed,
    view,
    clock,
    dayType,
    liveTrains,
    dark,
    language,
    label,
}: RouteScene3DProps) => {
    const showJourney = view === 'journey';
    const layout = networkLayout(network);
    const labelLayer = useRef<HTMLDivElement>(null);
    const colors = useMemo(
        () => new Map(network.lines.map((l) => [l.id, l.color])),
        [network]
    );

    const stops = showJourney ? routeStops(journey) : [];
    const onRoute = new Set(stops.map((s) => s.stationId));
    const spans = showJourney ? routeSpans(journey) : [];
    const { minX, maxX, minZ, maxZ } = layout.bounds;
    const bounds = showJourney
        ? journeyBounds(layout, journey)
        : {
              center: [(minX + maxX) / 2, 0, (minZ + maxZ) / 2] as Vec3,
              width: maxX - minX,
              depth: maxZ - minZ,
          };
    const byId = new Map(stations.map((s) => [s.id, s]));

    return (
        <div role="img" aria-label={label} className="relative h-full w-full">
            {/* drei positions labels from the left edge; in an RTL page an
                absolutely placed box without `left` hangs off the right edge
                instead, which shifts every label by its own width. */}
            <div
                ref={labelLayer}
                dir="ltr"
                className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
            />
            <Canvas
                dpr={[1, 1.75]}
                gl={{ antialias: true, alpha: true }}
                camera={{
                    position: [0, 40, 50],
                    fov: 38,
                    near: 0.1,
                    far: 400,
                }}
            >
                <ambientLight intensity={dark ? 0.55 : 0.9} />
                <hemisphereLight
                    args={[
                        dark ? '#a89bff' : '#ffffff',
                        dark ? '#0b0f1a' : '#e9e2d6',
                        0.6,
                    ]}
                />
                <directionalLight
                    position={[6, 12, 8]}
                    intensity={dark ? 0.9 : 1.3}
                />

                <gridHelper
                    args={[
                        160,
                        100,
                        dark ? '#2a3150' : '#d9d2c5',
                        dark ? '#1a2036' : '#ebe5da',
                    ]}
                    position={[0, -0.12, 0]}
                />

                {/* the whole network, dimmed */}
                {network.lines.map((line) => (
                    <LineTube
                        key={line.id}
                        points={layout.lines.get(line.id) ?? []}
                        color={line.color}
                        lit={false}
                        dark={dark}
                    />
                ))}

                {/* stations off the route: dots, interchanges as white beads */}
                {stations.map((station) => {
                    if (onRoute.has(station.id)) return null;
                    const p = layout.stations.get(station.id);
                    if (!p) return null;
                    const isInterchange = station.lineIds.length > 1;
                    return (
                        <mesh key={station.id} position={p}>
                            <sphereGeometry
                                args={[isInterchange ? 0.13 : 0.07, 12, 8]}
                            />
                            <meshStandardMaterial
                                color={
                                    isInterchange
                                        ? '#ffffff'
                                        : dark
                                          ? '#56607f'
                                          : '#a39cb8'
                                }
                            />
                        </mesh>
                    );
                })}

                {/* the journey */}
                {spans.map((span) => (
                    <LineTube
                        key={`${span.lineId}-${span.lo}-${span.hi}`}
                        points={layout.lines.get(span.lineId) ?? []}
                        from={span.lo}
                        to={span.hi}
                        color={colors.get(span.lineId) ?? '#ffffff'}
                        lit
                        dark={dark}
                    />
                ))}

                {stops.map((stop, i) => {
                    const station = byId.get(stop.stationId);
                    const p = layout.stations.get(stop.stationId);
                    if (!station || !p) return null;
                    return (
                        <RouteMarker
                            key={stop.stationId}
                            stop={stop}
                            station={station}
                            position={p}
                            color={colors.get(stop.lineId) ?? '#ffffff'}
                            labelBelow={i % 2 === 1}
                            dark={dark}
                            language={language}
                            labelLayer={labelLayer}
                            showLabel={stops.length <= MAX_STOP_LABELS}
                        />
                    );
                })}

                {showJourney ? (
                    <>
                        <Train
                            layout={layout}
                            journey={journey}
                            elapsed={elapsed}
                            colors={colors}
                        />
                        <NetworkTrains
                            network={network}
                            layout={layout}
                            clock={clock}
                            dayType={dayType}
                            colors={colors}
                            trains={liveTrains}
                        />
                    </>
                ) : (
                    <NetworkTrains
                        network={network}
                        layout={layout}
                        clock={clock}
                        dayType={dayType}
                        colors={colors}
                    />
                )}

                <CameraRig
                    center={bounds.center}
                    span={[bounds.width, bounds.depth]}
                    labelled={showJourney}
                />
            </Canvas>
        </div>
    );
};
