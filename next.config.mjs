// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Modify the webpack config however necessary
        return config;
    },

    // Add Google Fonts configuration here
    fonts: {
        google: {
            families: ["Noto Serif", "Merriweather", "Open Sans"], // Add your desired font families here
        },
    },

    basePath: '', // Only set this if needed

    // Any other configurations can be added here
};

export default nextConfig;
