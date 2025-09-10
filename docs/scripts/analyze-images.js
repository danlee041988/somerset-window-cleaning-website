#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Image Analysis Script
 * 
 * Analyzes current image usage in the project and provides recommendations
 */

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'];
const ASTRO_EXTENSIONS = ['.astro', '.tsx', '.jsx', '.ts', '.js'];

async function analyzeImageFile(filePath) {
  const stats = await fs.stat(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const name = path.basename(filePath);
  
  return {
    path: filePath,
    name,
    extension: ext,
    size: stats.size,
    sizeKB: Math.round(stats.size / 1024),
    sizeMB: Math.round(stats.size / 1024 / 1024 * 10) / 10,
    modified: stats.mtime
  };
}

async function findImageUsage(imageName, projectDir) {
  const usage = [];
  
  async function searchDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.startsWith('.')) {
        await searchDir(fullPath);
      } else if (entry.isFile() && ASTRO_EXTENSIONS.includes(path.extname(entry.name))) {
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          if (content.includes(imageName)) {
            usage.push(fullPath.replace(projectDir, ''));
          }
        } catch (error) {
          // Skip files we can't read
        }
      }
    }
  }
  
  await searchDir(projectDir);
  return usage;
}

async function analyzeImages() {
  const projectDir = path.join(__dirname, '../..');
  const imagesDir = path.join(projectDir, 'src/assets/images');
  const publicDir = path.join(projectDir, 'public/images');
  
  console.log('🔍 Analyzing images in Somerset Window Cleaning project...\n');
  
  const allImages = [];
  const largeImages = [];
  const unusedImages = [];
  const missingOptimized = [];
  
  // Find all images
  async function findImages(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await findImages(fullPath);
        } else if (entry.isFile() && IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
          const imageInfo = await analyzeImageFile(fullPath);
          allImages.push(imageInfo);
          
          // Check for large images
          if (imageInfo.sizeKB > 500 && !imageInfo.extension.match(/\.svg$/)) {
            largeImages.push(imageInfo);
          }
          
          // Check for missing optimized versions
          if (!fullPath.includes('optimized') && imageInfo.extension.match(/\.(jpg|jpeg|png)$/)) {
            const optimizedDir = path.join(path.dirname(fullPath), 'optimized');
            const hasOptimized = await fs.access(optimizedDir).then(() => true).catch(() => false);
            if (!hasOptimized) {
              missingOptimized.push(imageInfo);
            }
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist
    }
  }
  
  await findImages(imagesDir);
  await findImages(publicDir);
  
  // Check for unused images
  console.log('📊 Checking image usage...\n');
  for (const image of allImages) {
    const usage = await findImageUsage(image.name, projectDir);
    if (usage.length === 0) {
      unusedImages.push(image);
    }
  }
  
  // Report findings
  console.log('📈 Image Analysis Report');
  console.log('========================\n');
  
  console.log(`Total images: ${allImages.length}`);
  console.log(`Total size: ${Math.round(allImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024)} MB\n`);
  
  if (largeImages.length > 0) {
    console.log('⚠️  Large Images (>500KB):');
    largeImages.sort((a, b) => b.size - a.size).forEach(img => {
      console.log(`   - ${img.name} (${img.sizeMB} MB)`);
    });
    console.log('');
  }
  
  if (missingOptimized.length > 0) {
    console.log('❌ Images Missing Optimized Versions:');
    missingOptimized.forEach(img => {
      console.log(`   - ${img.path.replace(projectDir, '')}`);
    });
    console.log('');
  }
  
  if (unusedImages.length > 0) {
    console.log('🗑️  Potentially Unused Images:');
    unusedImages.forEach(img => {
      console.log(`   - ${img.name} (${img.sizeKB} KB)`);
    });
    console.log('');
  }
  
  // Format analysis
  const formatCounts = {};
  allImages.forEach(img => {
    formatCounts[img.extension] = (formatCounts[img.extension] || 0) + 1;
  });
  
  console.log('📊 Image Formats:');
  Object.entries(formatCounts).forEach(([ext, count]) => {
    console.log(`   - ${ext}: ${count} images`);
  });
  console.log('');
  
  // Recommendations
  console.log('💡 Recommendations:');
  console.log('==================\n');
  
  if (largeImages.length > 0) {
    console.log('1. Optimize large images:');
    console.log('   Run: npm run optimize-images');
    console.log('');
  }
  
  if (formatCounts['.png'] > 0 || formatCounts['.jpg'] > 0 || formatCounts['.jpeg'] > 0) {
    console.log('2. Convert to modern formats:');
    console.log('   - Use WebP/AVIF for better compression');
    console.log('   - The OptimizedImage component handles this automatically');
    console.log('');
  }
  
  if (unusedImages.length > 0) {
    console.log('3. Remove unused images to reduce repository size');
    console.log('');
  }
  
  console.log('4. Best practices:');
  console.log('   - Use OptimizedImage component for all images');
  console.log('   - Set critical={true} for above-the-fold images');
  console.log('   - Use appropriate sizes attribute for responsive loading');
  console.log('   - Consider lazy loading for below-the-fold images');
}

// Run the analysis
analyzeImages().catch(console.error);