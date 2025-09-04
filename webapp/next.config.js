/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sqlite3'],
  webpack: (config) => {
    // Ensure proper module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  }
}

module.exports = nextConfig
