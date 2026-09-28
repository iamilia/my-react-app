import { useReducedMotion } from 'motion/react';
import { useState } from 'react';

export type SceneMode = '3d' | '2d';
/** What the scene shows: your journey, or every scheduled train. */
export type SceneView = 'journey' | 'network';
export type FallbackReason = 'reduced-motion' | 'no-webgl' | 'low-end' | null;

const hasWebGL = (): boolean => {
    try {
        const canvas = document.createElement('canvas');
        return Boolean(
            canvas.getContext('webgl2') ?? canvas.getContext('webgl')
        );
    } catch {
        return false;
    }
};

/**
 * Rough "this device will struggle with a live WebGL scene" check. Both
 * signals are missing on some browsers (Safari has neither), in which case
 * the device gets the benefit of the doubt.
 */
const isLowEnd = (): boolean => {
    const nav = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { saveData?: boolean };
    };
    if (nav.connection?.saveData) return true;
    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) {
        return true;
    }
    return (
        typeof nav.hardwareConcurrency === 'number' &&
        nav.hardwareConcurrency > 0 &&
        nav.hardwareConcurrency <= 2
    );
};

/**
 * Picks the 3D scene or the SVG diagram. The automatic choice can be
 * overridden by the visitor, except that 3D is never offered without WebGL.
 */
export const useSceneMode = () => {
    const reducedMotion = useReducedMotion() ?? false;
    const [webgl] = useState(hasWebGL);
    const [lowEnd] = useState(isLowEnd);
    const [override, setOverride] = useState<SceneMode | null>(null);

    const reason: FallbackReason = !webgl
        ? 'no-webgl'
        : reducedMotion
          ? 'reduced-motion'
          : lowEnd
            ? 'low-end'
            : null;

    const automatic: SceneMode = reason ? '2d' : '3d';
    const mode: SceneMode = webgl ? (override ?? automatic) : '2d';

    return {
        mode,
        /** Why the automatic choice was 2D (shown as a hint), if it was. */
        reason: mode === '2d' && override === null ? reason : null,
        canUse3D: webgl,
        reducedMotion,
        setMode: setOverride,
    };
};
