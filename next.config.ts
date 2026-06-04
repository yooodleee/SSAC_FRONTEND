import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — 모든 콘텐츠 이미지 및 썸네일 CDN
      // BE(NotionImageMigrator)가 Notion S3 URL을 Cloudinary로 재업로드 후 영구 URL을 DB에 저장
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
