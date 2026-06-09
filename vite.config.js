import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import inertia from '@inertiajs/vite';

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ['resources/css/app.css',  'resources/js/app.tsx'],
            refresh: true,
        }),
        tailwindcss(),
        inertia({ssr: false}),
    ],
    server: {
        host: process.env.VITE_HMR_HOST ? '0.0.0.0' : 'localhost',
        hmr: {
            host: process.env.VITE_HMR_HOST ?? 'localhost',
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
