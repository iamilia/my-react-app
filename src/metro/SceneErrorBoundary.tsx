import { Component, type ReactNode } from 'react';

interface Props {
    /** Rendered instead of the children once they have thrown. */
    fallback: ReactNode;
    children: ReactNode;
}

/**
 * WebGL can pass feature detection and still fail at context creation (GPU
 * blocklists, lost contexts, the chunk failing to download). When the 3D
 * scene throws, the page keeps working with the 2D diagram instead.
 */
export class SceneErrorBoundary extends Component<Props, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}
