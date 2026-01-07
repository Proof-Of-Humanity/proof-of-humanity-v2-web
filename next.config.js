/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Default security headers for all routes
        // Provides baseline protection without requiring CORP for cross-origin resources
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // Strict headers for claim pages that use FFmpeg/SharedArrayBuffer
        // credentialless allows cross-origin resources without credentials while enabling SharedArrayBuffer
        source: '/:pohid/claim/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      {
        // Strict headers for FFmpeg worker files
        source: '/ffmpeg/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) config.resolve.fallback.fs = false;
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  env: {
    REACT_APP_IPFS_GATEWAY: process.env.REACT_APP_IPFS_GATEWAY,
    DEPLOYED_APP: process.env.DEPLOYED_APP,
    CHIADO_RPC: process.env.CHIADO_RPC,
    SEPOLIA_RPC: process.env.SEPOLIA_RPC,
    GNOSIS_RPC: process.env.GNOSIS_RPC,
    MAINNET_RPC: process.env.MAINNET_RPC,
    MAINNET_SUBGRAPH_URL: process.env.MAINNET_SUBGRAPH_URL,
    GNOSIS_SUBGRAPH_URL: process.env.GNOSIS_SUBGRAPH_URL,
    CHIADO_SUBGRAPH_URL: process.env.CHIADO_SUBGRAPH_URL,
    SEPOLIA_SUBGRAPH_URL: process.env.SEPOLIA_SUBGRAPH_URL,
    WALLET_CONNECT_PROJECT_ID: process.env.WALLET_CONNECT_PROJECT_ID,
    ATLAS_URI: process.env.ATLAS_URI,
    USER_SETTINGS_URL: process.env.USER_SETTINGS_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.REACT_APP_IPFS_GATEWAY,
        port: '',
        pathname: '/ipfs/**',
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
