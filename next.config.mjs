/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/ciidici',
    output: 'standalone',
    outputFileTracingExcludes: {
        '*': ['./uploads/**/*'],
    },
};

export default nextConfig;
