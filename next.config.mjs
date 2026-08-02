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
    ];
  },
};

export default nextConfig;
