#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Font Download Script
 * 
 * Downloads and optimizes Inter font files for self-hosting
 */

const FONT_URLS = {
  'inter-var.woff2': 'https://github.com/rsms/inter/releases/download/v4.0/Inter-Variable.woff2',
  'inter-regular.woff2': 'https://github.com/rsms/inter/releases/download/v4.0/Inter-Regular.woff2',
  'inter-medium.woff2': 'https://github.com/rsms/inter/releases/download/v4.0/Inter-Medium.woff2',
  'inter-semibold.woff2': 'https://github.com/rsms/inter/releases/download/v4.0/Inter-SemiBold.woff2',
  'inter-bold.woff2': 'https://github.com/rsms/inter/releases/download/v4.0/Inter-Bold.woff2',
};

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadFonts() {
  const fontsDir = path.join(__dirname, '../../../public/fonts');
  
  console.log('📥 Downloading Inter font files...\n');
  
  // Create fonts directory
  await fs.mkdir(fontsDir, { recursive: true });
  
  for (const [filename, url] of Object.entries(FONT_URLS)) {
    const filepath = path.join(fontsDir, filename);
    
    try {
      // Check if file already exists
      await fs.access(filepath);
      console.log(`✓ ${filename} already exists`);
    } catch {
      // Download file
      console.log(`⬇️  Downloading ${filename}...`);
      await downloadFile(url, filepath);
      
      const stats = await fs.stat(filepath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`✓ ${filename} (${sizeKB} KB)`);
    }
  }
  
  console.log('\n✅ All fonts downloaded successfully!');
  console.log(`📁 Fonts saved to: ${fontsDir}`);
  
  // Create a font license file
  const licenseContent = `Inter Font License

Copyright (c) 2016-2023 The Inter Project Authors.
"Inter" is a Reserved Font Name.
https://github.com/rsms/inter

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is available at: http://scripts.sil.org/OFL
`;
  
  await fs.writeFile(path.join(fontsDir, 'LICENSE.txt'), licenseContent);
  console.log('\n📄 Font license file created');
  
  console.log('\n💡 Next steps:');
  console.log('1. The fonts are now self-hosted in /public/fonts/');
  console.log('2. OptimizedFonts.astro component is configured to use them');
  console.log('3. Remove Google Fonts references from your project');
  console.log('4. Test font loading performance with Lighthouse');
}

// Run the script
downloadFonts().catch(console.error);