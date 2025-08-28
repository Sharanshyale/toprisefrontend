import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "toprisebucket.s3.eu-north-1.amazonaws.com",
      "firebasestorage.googleapis.com",
      "193.203.161.146",
    ],
  },

  // 👇 Add this block
  eslint: {
    // Setting this to true means `next build` will complete
    // even if there are ESLint errors. You'll still see the
    // errors in the console and in `npm run lint`.
    ignoreDuringBuilds: true,
  },

  // 👇 Add TypeScript configuration to ignore type errors during builds
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  // Add experimental configuration for better font handling
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
