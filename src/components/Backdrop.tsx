/**
 * Fixed ambient layer behind the whole page:
 * perspective grid + drifting aurora blooms + film grain.
 */
export const Backdrop = () => (
    <div className="backdrop-layer" aria-hidden="true">
        <div className="backdrop-grid" />
        <div className="backdrop-aurora aurora-a" />
        <div className="backdrop-aurora aurora-b" />
        <div className="backdrop-aurora aurora-c" />
        <div className="backdrop-noise" />
    </div>
);
