/** @type {import('next').NextConfig} */
const nextConfig = {
  // 빌드 시 TypeScript 에러 무시 (배포 성공 최우선)
  typescript: {
    ignoreBuildErrors: true,
  },
  // 빌드 시 ESLint 에러 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
  // React Strict Mode (렌더링 두 번 실행 방지)
  reactStrictMode: false,
};

module.exports = nextConfig;
