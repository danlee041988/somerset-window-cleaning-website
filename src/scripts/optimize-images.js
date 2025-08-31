import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Image Optimization Script
 * 
 * Converts images to modern formats (WebP, AVIF) with multiple sizes
 * for responsive loading
 */

const SIZES = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1920
};

const FORMATS = ['webp', 'avif', 'jpg'];
const QUALITY = {
  webp: 85,
  avif: 80,
  jpg: 85
};

async function optimizeImage(inputPath, outputDir) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const stats = await fs.stat(inputPath);
  
  console.log(`Optimizing ${filename}...`);
  
  // Create output directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });
  
  // Process each size
  for (const [sizeName, width] of Object.entries(SIZES)) {
    // Process each format
    for (const format of FORMATS) {
      const outputPath = path.join(outputDir, `${filename}-${sizeName}.${format}`);
      
      try {
        await sharp(inputPath)
          .resize(width, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .toFormat(format, {
            quality: QUALITY[format],
            effort: 6 // Higher effort for better compression
          })
          .toFile(outputPath);
        
        const outputStats = await fs.stat(outputPath);
        const reduction = Math.round((1 - outputStats.size / stats.size) * 100);
        console.log(`  ✓ ${filename}-${sizeName}.${format} (${reduction}% smaller)`);
      } catch (error) {
        console.error(`  ✗ Failed to create ${filename}-${sizeName}.${format}: ${error.message}`);
      }
    }
  }
}

async function findImagesToOptimize(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const images = [];
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.includes('optimized') && !entry.name.includes('node_modules')) {
      // Recurse into subdirectories
      images.push(...await findImagesToOptimize(fullPath));
    } else if (entry.isFile()) {
      // Check if it's an image that needs optimization
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext) && !fullPath.includes('optimized')) {
        images.push(fullPath);
      }
    }
  }
  
  return images;
}

async function main() {
  const imagesDir = path.join(__dirname, '../../assets/images');
  const images = await findImagesToOptimize(imagesDir);
  
  console.log(`Found ${images.length} images to optimize\n`);
  
  for (const imagePath of images) {
    const dir = path.dirname(imagePath);
    const outputDir = path.join(dir, 'optimized');
    
    await optimizeImage(imagePath, outputDir);
  }
  
  console.log('\nOptimization complete!');
  console.log('\nNext steps:');
  console.log('1. Update your components to use the optimized images');
  console.log('2. Use <Picture> or OptimizedImage component for responsive loading');
  console.log('3. Delete original images after verifying optimized versions');
}

// Run the script
main().catch(console.error);