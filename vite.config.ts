import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
            '@tabler/icons-react':
                '@tabler/icons-react/dist/esm/icons/index.mjs',
        },
    },
    server: {
        proxy: {
            // Analytics lives on the Express app; in dev it runs on :3000 and
            // Vite forwards `/_a` to it so the dashboard works the same way
            // locally as it does in production.
            '/_a': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            // Same deal for the GitHub proxy: the client only ever talks to
            // our own origin, so dev has to forward it too.
            '/_gh': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});
