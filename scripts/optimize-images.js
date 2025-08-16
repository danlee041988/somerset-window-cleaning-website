#!/usr/bin/env node

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceDir = join(__dirname, '../src/assets/images');
const outputDir = join(__dirname, '../src/assets/images/optimized');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Configuration for different image types
const imageConfigs = [
  {
    source: 'solar-panels.jpeg',
    output: 'solar-panels',
    sizes: [
      { width: 400, suffix: '-sm' },
      { width: 800, suffix: '-md' }, 
      { width: 1200, suffix: '-lg' },
      { width: 1920, suffix: '-xl' }
    ],
    quality: 85
  },
  {
    source: 'DJI_0007.JPG',
    output: 'hero-aerial',
    sizes: [
      { width: 400, suffix: '-sm' },
      { width: 800, suffix: '-md' },
      { width: 1200, suffix: '-lg' },
      { width: 1920, suffix: '-xl' }
    ],
    quality: 85
  },
  {
    source: 'hero-image.png',
    output: 'hero-main',
    sizes: [
      { width: 400, suffix: '-sm' },
      { width: 800, suffix: '-md' },
      { width: 1200, suffix: '-lg' },
      { width: 1920, suffix: '-xl' }
    ],
    quality: 90
  }
];

async function optimizeImage(inputPath, outputPath, width, quality, format) {
  let pipeline = sharp(inputPath);
  
  // Special handling for solar panels image - rotate 180 degrees
  if (inputPath.includes('solar-panels.jpeg')) {
    pipeline = pipeline.rotate(180);
  } else {
    pipeline = pipeline.rotate(); // Auto-rotate based on EXIF orientation for others
  }
  
  pipeline = pipeline.resize(width, null, { 
    withoutEnlargement: true,
    fit: 'inside'
  });

  switch (format) {
    case 'webp':
      pipeline.webp({ quality, effort: 6 });
      break;
    case 'avif':
      pipeline.avif({ quality, effort: 9 });
      break;
    case 'jpeg':
      pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  await pipeline.toFile(outputPath);
}

async function processImages() {
  console.log('🖼️  Starting image optimization...\n');

  for (const config of imageConfigs) {
    const inputPath = join(sourceDir, config.source);
    
    if (!existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${config.source} - file not found`);
      continue;
    }

    console.log(`📸 Processing ${config.source}...`);

    // Get original file size
    const { size: originalSize } = await sharp(inputPath).metadata();
    console.log(`   Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);

    for (const size of config.sizes) {
      // Generate WebP versions
      const webpPath = join(outputDir, `${config.output}${size.suffix}.webp`);
      await optimizeImage(inputPath, webpPath, size.width, config.quality, 'webp');

      // Generate AVIF versions (smaller but newer format)
      const avifPath = join(outputDir, `${config.output}${size.suffix}.avif`);
      await optimizeImage(inputPath, avifPath, size.width, config.quality - 5, 'avif');

      // Generate fallback JPEG versions
      const jpegPath = join(outputDir, `${config.output}${size.suffix}.jpg`);
      await optimizeImage(inputPath, jpegPath, size.width, config.quality, 'jpeg');

      // Check compressed file sizes
      const webpSize = (await sharp(webpPath).metadata()).size;
      const avifSize = (await sharp(avifPath).metadata()).size;
      const jpegSize = (await sharp(jpegPath).metadata()).size;

      console.log(`   ${size.width}px: WebP ${(webpSize / 1024).toFixed(1)}KB | AVIF ${(avifSize / 1024).toFixed(1)}KB | JPEG ${(jpegSize / 1024).toFixed(1)}KB`);
    }

    console.log(`   ✅ ${config.source} optimized\n`);
  }

  console.log('🎉 Image optimization complete!');
}

// Run the optimization
processImages().catch(console.error);