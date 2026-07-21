import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles the build output — no 'standalone' needed
  // API rewrites so frontend can call /api/* without CORS in production
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
