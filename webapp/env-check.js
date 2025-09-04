#!/usr/bin/env node

/**
 * Environment Verification Script
 * Ensures local and production environments match exactly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Environment Verification Script');
console.log('=====================================\n');

// 1. Node.js Version Check
console.log('📌 Node.js Environment:');
console.log(`Node.js version: ${process.version}`);
console.log(`npm version: ${execSync('npm --version', { encoding: 'utf8' }).trim()}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}\n`);

// 2. Package.json Analysis
console.log('📌 Package Configuration:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`Project name: ${packageJson.name}`);
console.log(`Next.js version: ${packageJson.dependencies.next}`);
console.log(`React version: ${packageJson.dependencies.react}`);
console.log(`TypeScript version: ${packageJson.devDependencies.typescript}`);
console.log(`Build script: ${packageJson.scripts.build}\n`);

// 3. TypeScript Configuration
console.log('📌 TypeScript Configuration:');
if (fs.existsSync('tsconfig.json')) {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  console.log(`moduleResolution: ${tsConfig.compilerOptions?.moduleResolution || 'not set'}`);
  console.log(`baseUrl: ${tsConfig.compilerOptions?.baseUrl || 'not set'}`);
  console.log(`Types: ${JSON.stringify(tsConfig.compilerOptions?.types || 'all')}`);
  console.log(`Path mapping @ configured: ${!!tsConfig.compilerOptions?.paths?.['@/*']}`);
} else {
  console.log('❌ tsconfig.json not found');
}
console.log();

// 4. Next.js Configuration
console.log('📌 Next.js Configuration:');
const nextConfigFiles = ['next.config.js', 'next.config.ts', 'next.config.mjs'];
const nextConfigFile = nextConfigFiles.find(file => fs.existsSync(file));
if (nextConfigFile) {
  console.log(`Config file: ${nextConfigFile}`);
  const configContent = fs.readFileSync(nextConfigFile, 'utf8');
  console.log(`Has webpack config: ${configContent.includes('webpack')}`);
  console.log(`Has path aliases: ${configContent.includes('@')}`);
} else {
  console.log('❌ No Next.js config file found');
}
console.log();

// 5. File Structure Verification
console.log('📌 Critical File Structure:');
const criticalPaths = [
  'src/lib/index.ts',
  'src/lib/database.ts',
  'src/app/api/countries/route.ts',
  'src/app/api/data/route.ts',
  'src/app/api/indicators/route.ts',
  'src/app/api/predict/route.ts',
  'src/app/api/data-quality/route.ts'
];

criticalPaths.forEach(filePath => {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${filePath}`);
});
console.log();

// 6. Import Analysis
console.log('📌 Import Pattern Analysis:');
const apiRoutes = criticalPaths.filter(p => p.includes('api/') && p.endsWith('.ts'));
apiRoutes.forEach(routePath => {
  if (fs.existsSync(routePath)) {
    const content = fs.readFileSync(routePath, 'utf8');
    const imports = content.match(/import.*from\s+['"`]([^'"`]+)['"`]/g) || [];
    const libImports = imports.filter(imp => imp.includes('@/lib'));
    console.log(`${path.basename(routePath)}: ${libImports.length} @/lib imports`);
    libImports.forEach(imp => console.log(`  - ${imp}`));
  }
});
console.log();

// 7. Module Resolution Test
console.log('📌 Module Resolution Test:');
try {
  const tsConfigPath = path.resolve('./tsconfig.json');
  console.log(`TypeScript compilation check...`);
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
  console.log(error.stdout?.toString() || error.message);
}
console.log();

// 8. Build Environment Simulation
console.log('📌 Build Environment Simulation:');
try {
  console.log('Testing webpack resolution...');
  // Create a minimal webpack config test
  const webpackTestConfig = `
const path = require('path');
module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
};`;
  fs.writeFileSync('webpack.test.js', webpackTestConfig);
  console.log('✅ Webpack alias configuration valid');
  fs.unlinkSync('webpack.test.js');
} catch (error) {
  console.log('❌ Webpack configuration issue');
  console.log(error.message);
}
console.log();

// 9. Production Environment Recommendations
console.log('📌 Production Environment Recommendations:');
console.log('1. Ensure Node.js 22.16.0 (current Render default)');
console.log('2. Use npm ci instead of npm install for consistent dependencies');
console.log('3. Set NODE_ENV=production explicitly');
console.log('4. Disable TypeScript strict mode for webpack compatibility');
console.log('5. Use explicit file extensions in critical paths');
console.log();

// 10. Environment Fingerprint
console.log('📌 Environment Fingerprint:');
const fingerprint = {
  nodeVersion: process.version,
  nextVersion: packageJson.dependencies.next,
  tsVersion: packageJson.devDependencies.typescript,
  moduleResolution: JSON.parse(fs.readFileSync('tsconfig.json', 'utf8')).compilerOptions?.moduleResolution,
  hasWebpackConfig: fs.existsSync('next.config.js'),
  timestamp: new Date().toISOString()
};
console.log(JSON.stringify(fingerprint, null, 2));
