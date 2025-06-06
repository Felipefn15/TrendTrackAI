import { build } from 'vite';
import { execSync } from 'child_process';

async function buildProject() {
  try {
    // Build the client
    console.log('Building client...');
    await build();
    
    // Build the server
    console.log('Building server...');
    execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api', { stdio: 'inherit' });
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildProject();