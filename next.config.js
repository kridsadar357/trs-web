const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Parent dirs with their own package-lock.json (e.g. ~/web + ~/web/trs-web) otherwise
  // become the inferred workspace root and standalone ends up at .next/standalone/trs-web/server.js.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
