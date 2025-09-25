/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            animation: {
                'gradient-shift': 'gradient-shift 6s ease infinite',
                'spin-slow': 'spin 20s linear infinite',
                'bounce-slow': 'bounce 3s infinite',
                'pulse-slow': 'pulse 4s infinite',
            },
            keyframes: {
                'gradient-shift': {
                    '0%, 100%': { 'background-position': '0% 50%' },
                    '50%': { 'background-position': '100% 50%' },
                }
            },
            backdropBlur: {
                'xs': '2px',
                '4xl': '72px',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            }
        },
    },
    plugins: [],
}