/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/ciidici',
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    // La raíz del dominio (fuera del basePath) lleva a la aplicación. No puede hacerse en el
    // middleware: con basePath, "/ciidici" se ve como "/" y se redirigiría a sí mismo.
    async redirects() {
        return [
            { source: '/', destination: '/ciidici', basePath: false, permanent: false },
        ];
    },
    outputFileTracingExcludes: {
        '*': ['./uploads/**/*'],
    },
};

export default nextConfig;
