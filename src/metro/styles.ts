/**
 * Native <select> styling. Every class sets an opaque background and a text
 * colour: the dropdown list is drawn by the OS, and on Windows it takes its
 * colours from the <select>/<option> — a translucent background there turns
 * into white behind light text in dark mode.
 */
export const SELECT_FIELD =
    'w-full cursor-pointer appearance-none rounded-xl border border-(--line-strong) bg-(--bg) py-3 ps-4 pe-10 text-base font-semibold text-(--fg) transition-colors hover:border-(--accent) focus-visible:border-(--accent) focus-visible:outline-none';

export const SELECT_SMALL =
    'cursor-pointer rounded-lg border border-(--line-strong) bg-(--bg) px-2 py-1.5 text-sm text-(--fg)';

export const SELECT_OPTION = 'bg-(--bg) text-(--fg)';
