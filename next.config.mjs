/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API calls to the Flask dev server during local development.
  // In production on Vercel, vercel.json rewrites handle this instead.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5328/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:5328/uploads/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
