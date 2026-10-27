import { basePath } from './src/utils/basePath.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath,
    output: 'standalone',
    serverExternalPackages: ['handlebars', 'puppeteer'],
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    // La raíz del dominio (fuera del basePath) lleva a la aplicación. No puede hacerse en el
    // middleware: con basePath, "/ciidici" se ve como "/" y se redirigiría a sí mismo.
    async redirects() {
        return [
            { source: '/', destination: basePath, basePath: false, permanent: false },
        ];
    },
    outputFileTracingExcludes: {
        '*': ['./uploads/**/*'],
    },
};

export default nextConfig;
