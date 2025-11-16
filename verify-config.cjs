#!/usr/bin/env node

/**
 * Verifikasi konfigurasi vercel.json untuk sitemap
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Memverifikasi konfigurasi Vercel...\n');

try {
  // Read vercel.json
  const vercelPath = path.join(__dirname, 'vercel.json');
  const config = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));

  console.log('✅ vercel.json loaded successfully');

  // Check if routes exist
  if (!config.routes) {
    console.error('❌ No routes configuration found');
    process.exit(1);
  }

  console.log(`✅ Found ${config.routes.length} route(s)`);

  // Check for filesystem handle
  const hasFilesystem = config.routes.some(r => r.handle === 'filesystem');
  if (hasFilesystem) {
    console.log('✅ Filesystem handle present (static files will be served first)');
  } else {
    console.warn('⚠️  No filesystem handle found');
  }

  // Check for sitemap route
  const sitemapRoute = config.routes.find(r => r.src && r.src.includes('sitemap'));
  if (sitemapRoute) {
    console.log('✅ Sitemap route found with headers');
    if (sitemapRoute.headers && sitemapRoute.headers['Content-Type']) {
      console.log(`   Content-Type: ${sitemapRoute.headers['Content-Type']}`);
    }
  } else {
    console.warn('⚠️  No specific sitemap route found');
  }

  // Check for catch-all route
  const catchAll = config.routes.find(r => r.src === '/(.*)' && r.dest === '/index.html');
  if (catchAll) {
    console.log('✅ Catch-all route present for SPA routing');
  } else {
    console.warn('⚠️  No catch-all route found');
  }

  // Verify sitemap.xml exists
  const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    console.log('✅ sitemap.xml exists in public/');
  } else {
    console.error('❌ sitemap.xml not found in public/');
    process.exit(1);
  }

  // Verify robots.txt exists
  const robotsPath = path.join(__dirname, 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    console.log('✅ robots.txt exists in public/');
  } else {
    console.error('❌ robots.txt not found in public/');
    process.exit(1);
  }

  console.log('\n✨ Konfigurasi valid!\n');
  console.log('📝 Next steps:');
  console.log('1. Commit changes: git add . && git commit -m "fix: Simplify vercel.json for compatibility"');
  console.log('2. Push to deploy: git push');
  console.log('3. Verify: https://sl2.my.id/sitemap.xml');
  console.log('4. Submit to Google Search Console');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
