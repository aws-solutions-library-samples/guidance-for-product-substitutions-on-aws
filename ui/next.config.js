/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  transpilePackages: ['@cloudscape-design/components', '@cloudscape-design/component-toolkit'],
};

module.exports = nextConfig;
