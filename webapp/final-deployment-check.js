#!/usr/bin/env node

/**
 * Final Pre-Deployment Verification
 * Ensures all configurations are Render-ready
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 FINAL RENDER DEPLOYMENT VERIFICATION');
console.log('==========================================\n');

let allGood = true;

// 1. Check .nvmrc format
console.log('📌 Checking .nvmrc format:');
if (fs.existsSync('.nvmrc')) {
  const nvmrcContent = fs.readFileSync('.nvmrc', 'utf8').trim();
  if (nvmrcContent === '22.16.0') {
    console.log('✅ .nvmrc: Correct format (22.16.0)');
  } else {
    console.log(`❌ .nvmrc: Invalid content: "${nvmrcContent}"`);
    allGood = false;
  }
} else {
  console.log('❌ .nvmrc: File missing');
  allGood = false;
}

// 2. Check render-build.sh
console.log('\n📌 Checking render-build.sh:');
if (fs.existsSync('render-build.sh')) {
  const stats = fs.statSync('render-build.sh');
  const isExecutable = (stats.mode & parseInt('111', 8)) !== 0;
  if (isExecutable) {
    console.log('✅ render-build.sh: Executable permissions set');
  } else {
    console.log('❌ render-build.sh: Missing executable permissions');
    allGood = false;
  }
} else {
  console.log('❌ render-build.sh: File missing');
  allGood = false;
}

// 3. Check package.json engines
console.log('\n📌 Checking package.json engines:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (packageJson.engines && packageJson.engines.node === '22.16.0') {
  console.log('✅ package.json: Node.js engine specified (22.16.0)');
} else {
  console.log('❌ package.json: Missing or incorrect Node.js engine specification');
  allGood = false;
}

// 4. Check next.config.js
console.log('\n📌 Checking next.config.js:');
if (fs.existsSync('next.config.js')) {
  const configContent = fs.readFileSync('next.config.js', 'utf8');
  if (configContent.includes('@/lib') && configContent.includes('webpack')) {
    console.log('✅ next.config.js: Enhanced webpack configuration present');
  } else {
    console.log('❌ next.config.js: Missing enhanced webpack configuration');
    allGood = false;
  }
} else {
  console.log('❌ next.config.js: File missing');
  allGood = false;
}

// 5. Check critical files
console.log('\n📌 Checking critical files:');
const criticalFiles = [
  'src/lib/index.ts',
  'src/lib/database.ts',
  'requirements.txt',
  'tsconfig.json'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: Present`);
  } else {
    console.log(`❌ ${file}: Missing`);
    allGood = false;
  }
});

// 6. Final status
console.log('\n🎯 DEPLOYMENT READINESS:');
if (allGood) {
  console.log('✅ ALL CHECKS PASSED - READY FOR RENDER DEPLOYMENT!');
  console.log('\n🚀 Next Steps:');
  console.log('1. Update Render Build Command to: ./render-build.sh');
  console.log('2. Clear Render build cache');
  console.log('3. Trigger manual deploy');
  console.log('4. Monitor build logs for success');
} else {
  console.log('❌ SOME ISSUES FOUND - NEED TO FIX BEFORE DEPLOYMENT');
}

process.exit(allGood ? 0 : 1);
