/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // the default image loader needs a server; static export has none
  images: { unoptimized: true },
};

module.exports = nextConfig;
