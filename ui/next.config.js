/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@cloudscape-design/components', '@cloudscape-design/component-toolkit'],
};

module.exports = nextConfig;
