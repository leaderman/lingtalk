import type { NextConfig } from 'next';
import { cpSync, existsSync } from 'fs';
import path from 'path';

// 构建时自动复制 resources 目录到输出目录
const copyResources = () => {
  const srcDir = path.join(process.cwd(), 'resources');
  const destDir = path.join(process.cwd(), '.next', 'resources');
  
  if (existsSync(srcDir)) {
    try {
      cpSync(srcDir, destDir, { recursive: true });
      console.log('Resources directory copied to .next/resources');
    } catch (err) {
      console.error('Failed to copy resources:', err);
    }
  }
};

// 执行复制
copyResources();

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
