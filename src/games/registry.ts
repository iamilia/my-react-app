import {
    IconBomb,
    IconBrain,
    IconGridDots,
    type IconProps,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

export interface GameMeta {
    /** Also the i18n key: `games.items.<id>.title` / `.description`. */
    id: string;
    /** Route, or null while the game is still just a plan. */
    path: string | null;
    status: 'live' | 'soon';
    icon: ComponentType<IconProps>;
    /** Short, untranslated labels — they read the same in both languages. */
    tags: string[];
}

/**
 * The single place a game gets registered. Adding one means an entry here, a
 * `games.items.<id>` block in both translation files, and a route in App.tsx.
 */
export const GAMES: GameMeta[] = [
    {
        id: '2048',
        path: '/game/2048',
        status: 'live',
        icon: IconGridDots,
        tags: ['Puzzle', 'Solo', 'Keyboard'],
    },
    {
        id: 'memory',
        path: null,
        status: 'soon',
        icon: IconBrain,
        tags: ['Memory', 'Solo'],
    },
    {
        id: 'minesweeper',
        path: null,
        status: 'soon',
        icon: IconBomb,
        tags: ['Logic', 'Solo'],
    },
];
