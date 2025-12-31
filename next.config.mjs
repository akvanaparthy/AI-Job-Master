/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // API Routes configuration
  api: {
    bodyParser: {
      sizeLimit: '5mb', // Limit request body size to prevent memory exhaustion
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Optimize font loading
  optimizeFonts: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        { module: /node_modules\/@supabase/ },
      ];
    }
    return config;
  },
};

export default nextConfig;
