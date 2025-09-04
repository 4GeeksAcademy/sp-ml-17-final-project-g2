const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sqlite3'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ensure @ alias resolution works in all environments
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/lib/database': path.resolve(__dirname, 'src/lib/database.ts'),
      '@/lib/index': path.resolve(__dirname, 'src/lib/index.ts'),
    };

    // Add fallbacks for better module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Ensure proper module resolution in production
    config.resolve.modules = [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ];

    // Add explicit extensions
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

    return config;
  },
};

module.exports = nextConfig;
