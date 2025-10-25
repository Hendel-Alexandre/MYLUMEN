import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Enable experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Transpile packages that need it
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

  // Webpack configuration for compatibility
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },

  // Ensure API routes are included in build
  outputFileTracingIncludes: {
    '/api/**/*': ['./src/db/**/*'],
  },
};

export default nextConfig;