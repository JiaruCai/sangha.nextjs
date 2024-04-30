// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Modify the webpack config however necessary
        return config;
    },

    basePath: '', // Only set this if needed

    // Any other configurations can be added here
};

export default nextConfig;