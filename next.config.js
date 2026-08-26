const ipfsGatewayHostname = process.env.REACT_APP_IPFS_GATEWAY;

if (!ipfsGatewayHostname) {
  throw new Error(
    "Missing required environment variable: REACT_APP_IPFS_GATEWAY",
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Tree-shake barrel imports for heavy libs (Next 15-safe, opt-in).
    optimizePackageImports: ["wagmi", "viem"],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
      };
    }

    // Next treats .svg as a static asset by default. Exclude it from that
    // pipeline and run SVGR so `import Icon from "*.svg"` yields a component.
    // See https://react-svgr.com/docs/next/
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule.test instanceof RegExp && rule.test.test(".svg"),
    );

    if (fileLoaderRule) {
      config.module.rules.push({
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      });
      config.module.rules.push({
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: {
          not: [...(fileLoaderRule.resourceQuery?.not || []), /url/],
        },
        use: ["@svgr/webpack"],
      });
      fileLoaderRule.exclude = /\.svg$/i;
    } else {
      config.module.rules.push({
        test: /\.svg$/i,
        use: ["@svgr/webpack"],
      });
    }

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
        protocol: "https",
        hostname: ipfsGatewayHostname,
        port: "",
        pathname: "/ipfs/**",
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
