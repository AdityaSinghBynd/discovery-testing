/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  images: {
    domains: ["byndpdfstorage.blob.core.windows.net"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "byndpdfstorage.blob.core.windows.net",
        pathname: "/**", // Allow all paths under the domain
      },
    ],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
