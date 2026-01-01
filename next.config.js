/** @type {import('next').NextConfig} */
const nextConfig = {
  // 빌드 시 TypeScript 에러 무시
  typescript: {
    ignoreBuildErrors: true,
  },
  // 빌드 시 ESLint 에러 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
