import type { NextConfig } from 'next';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isProjectPage = process.env.GITHUB_ACTIONS === 'true' && repositoryName && !repositoryName.endsWith('.github.io');
const assetPrefix = isProjectPage ? `/${repositoryName}` : '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  assetPrefix,
};

export default nextConfig;
