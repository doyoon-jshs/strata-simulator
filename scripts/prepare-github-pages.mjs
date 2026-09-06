import { existsSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];

if (!repositoryName) {
  throw new Error('GITHUB_REPOSITORY is required to prepare the GitHub Pages build.');
}

const outputDirectory = join(process.cwd(), 'dist', 'client');
const nestedDirectory = join(outputDirectory, repositoryName);
const nestedAssets = join(nestedDirectory, '_next');
const publicAssets = join(outputDirectory, '_next');

if (!existsSync(nestedAssets)) {
  throw new Error(`Expected generated assets at ${nestedAssets}.`);
}

rmSync(publicAssets, { recursive: true, force: true });
renameSync(nestedAssets, publicAssets);
rmSync(nestedDirectory, { recursive: true, force: true });
writeFileSync(join(outputDirectory, '.nojekyll'), '');

