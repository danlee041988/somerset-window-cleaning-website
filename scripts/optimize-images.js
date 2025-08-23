import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '../src/assets/images');
const serviceImagesDir = path.join(imagesDir, 'services');

// Optimization settings
const optimizations = {
  jpeg: {
    quality: 75,
    progressive: true,
    mozjpeg: true
  },
  webp: {
    quality: 75,
    effort: 6
  },
  resize: {
    // Maximum dimensions for different image types
    hero: { width: 1920, height: 1080 },
    service: { width: 1200, height: 800 },
    thumbnail: { width: 600, height: 400 }
  }
};

async function optimizeImage(inputPath, outputPath, options = {}) {
  try {
    const { width, height, quality = 75 } = options;
    
    let pipeline = sharp(inputPath);
    
    // Resize if dimensions provided
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'cover',
        position: 'center'
      });
    }
    
    // Determine output format from file extension
    const ext = path.extname(outputPath).toLowerCase();
    
    if (ext === '.webp') {
      pipeline = pipeline.webp({ quality, effort: 6 });
    } else if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
    }
    
    await pipeline.toFile(outputPath);
    
    // Get file sizes
    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const savings = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
    console.log(`   ${formatBytes(inputStats.size)} -> ${formatBytes(outputStats.size)} (${savings}% smaller)`);
    
    return { inputSize: inputStats.size, outputSize: outputStats.size, savings };
    
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
    return null;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function optimizeServicesImages() {
  console.log('🚀 Optimizing service images...\n');
  
  const images = [
    'IMG_0750.jpeg',
    '20250318_163457~3-edited.jpg', 
    'Image.jpg'
  ];
  
  let totalInputSize = 0;
  let totalOutputSize = 0;
  
  for (const image of images) {
    const inputPath = path.join(serviceImagesDir, image);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Image not found: ${image}`);
      continue;
    }
    
    // Create optimized versions
    const baseName = path.parse(image).name;
    const outputDir = path.join(serviceImagesDir, 'optimized');
    
    // Create optimized directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Create multiple optimized versions
    const variants = [
      {
        suffix: '-large.webp',
        ...optimizations.resize.service,
        quality: 75,
        format: 'webp'
      },
      {
        suffix: '-large.jpg',
        ...optimizations.resize.service,
        quality: 75,
        format: 'jpeg'
      },
      {
        suffix: '-medium.webp',
        width: 800,
        height: 600,
        quality: 75,
        format: 'webp'
      },
      {
        suffix: '-small.webp',
        width: 400,
        height: 300,
        quality: 70,
        format: 'webp'
      }
    ];
    
    console.log(`\n📸 Processing: ${image}`);
    
    for (const variant of variants) {
      const outputPath = path.join(outputDir, `${baseName}${variant.suffix}`);
      const result = await optimizeImage(inputPath, outputPath, variant);
      
      if (result) {
        totalInputSize += result.inputSize;
        totalOutputSize += result.outputSize;
      }
    }
  }
  
  // Summary
  const totalSavings = ((totalInputSize - totalOutputSize) / totalInputSize * 100).toFixed(1);
  console.log(`\n📊 OPTIMIZATION SUMMARY:`);
  console.log(`   Total input size: ${formatBytes(totalInputSize)}`);
  console.log(`   Total output size: ${formatBytes(totalOutputSize)}`);
  console.log(`   Total savings: ${totalSavings}%`);
}

async function optimizeMainImages() {
  console.log('\n🚀 Optimizing main images...\n');
  
  const mainImages = [
    {
      input: 'solar-panels.jpeg',
      outputs: [
        { suffix: '-hero.webp', ...optimizations.resize.hero, quality: 75 },
        { suffix: '-large.webp', ...optimizations.resize.service, quality: 75 },
        { suffix: '-medium.webp', width: 800, height: 600, quality: 75 }
      ]
    },
    {
      input: 'DJI_0007.JPG',
      outputs: [
        { suffix: '-hero.webp', ...optimizations.resize.hero, quality: 75 },
        { suffix: '-large.webp', ...optimizations.resize.service, quality: 75 }
      ]
    }
  ];
  
  for (const imageSet of mainImages) {
    const inputPath = path.join(imagesDir, imageSet.input);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Image not found: ${imageSet.input}`);
      continue;
    }
    
    console.log(`\n📸 Processing: ${imageSet.input}`);
    const baseName = path.parse(imageSet.input).name;
    
    for (const output of imageSet.outputs) {
      const outputPath = path.join(imagesDir, 'optimized', `${baseName}${output.suffix}`);
      await optimizeImage(inputPath, outputPath, output);
    }
  }
}

// Run optimization
async function main() {
  console.log('🎯 SOMERSET WINDOW CLEANING - IMAGE OPTIMIZATION');
  console.log('================================================\n');
  
  await optimizeServicesImages();
  await optimizeMainImages();
  
  console.log('\n✅ Optimization complete!');
  console.log('\n💡 Next steps:');
  console.log('   1. Update image references to use optimized versions');
  console.log('   2. Implement responsive image loading');
  console.log('   3. Add lazy loading for better performance');
}

main().catch(console.error);