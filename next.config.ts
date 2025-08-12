import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['phaser'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
