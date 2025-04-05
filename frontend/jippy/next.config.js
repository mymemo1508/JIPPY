const withPWA = require("@ducanh2912/next-pwa").default;

/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'jippy.s3.ap-northeast-2.amazonaws.com'
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/m/:path*",
        destination: "/mobile/:path*",
      },
    ]
  }
};

module.exports = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200
        }
      }
    }
  ]
})(nextConfig);