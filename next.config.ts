import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: { root: import.meta.dirname },
  serverExternalPackages: ['sharp', '@prisma/client'],
}

export default nextConfig
