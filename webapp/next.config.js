const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sqlite3'],
  webpack: (config) => {
    // Simple and robust alias configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    return config;
  },
};

module.exports = nextConfig;
