import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Use Turbopack for development
    turbo: {},
  },
  // Skip type checking during build (already done in CI)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
