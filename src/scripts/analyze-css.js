#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PurgeCSS } from 'purgecss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CSS Analysis Script
 * 
 * Analyzes CSS usage and identifies unused styles
 */

async function analyzeCSSUsage() {
  const projectDir = path.join(__dirname, '../..');
  
  console.log('🔍 Analyzing CSS usage in Somerset Window Cleaning project...\n');
  
  try {
    // Find all CSS files
    const cssFiles = [];
    async function findCSS(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.startsWith('.')) {
          await findCSS(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.css')) {
          cssFiles.push(fullPath);
        }
      }
    }
    
    await findCSS(path.join(projectDir, 'src'));
    await findCSS(path.join(projectDir, 'dist')).catch(() => {}); // Ignore if dist doesn't exist
    
    console.log(`Found ${cssFiles.length} CSS files\n`);
    
    // Analyze main Tailwind CSS file
    const mainCSSPath = path.join(projectDir, 'src/assets/styles/tailwind.css');
    const mainCSS = await fs.readFile(mainCSSPath, 'utf-8');
    
    // Count CSS rules
    const ruleCount = (mainCSS.match(/{/g) || []).length;
    console.log(`Main CSS file has approximately ${ruleCount} rules\n`);
    
    // Run PurgeCSS to find unused styles
    console.log('Running PurgeCSS analysis...\n');
    
    const purgeCSSResult = await new PurgeCSS().purge({
      content: [
        path.join(projectDir, 'src/**/*.{astro,html,js,jsx,ts,tsx,vue}'),
        path.join(projectDir, 'src/**/*.mdx'),
      ],
      css: [mainCSSPath],
      defaultExtractor: content => {
        // Capture classes, ids, and tags
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
        const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
        return broadMatches.concat(innerMatches);
      },
      safelist: {
        standard: [
          /^(hover|focus|active|disabled|group-hover|dark):/,
          /^(sm|md|lg|xl|2xl):/,
          /^animate-/,
          /^motion-/,
          /^transition/,
          /^transform/,
          /^bg-(red|gray|black|white)/,
          /^text-(red|gray|black|white)/,
          /^border-(red|gray|black|white)/,
        ],
        deep: [
          /btn/,
          /form/,
          /modal/,
          /dropdown/,
        ],
        greedy: [
          /^swiper/,
          /^leaflet/,
        ]
      }
    });
    
    // Calculate savings
    const originalSize = Buffer.byteLength(mainCSS, 'utf8');
    const purgedSize = Buffer.byteLength(purgeCSSResult[0].css, 'utf8');
    const savings = originalSize - purgedSize;
    const savingsPercent = Math.round((savings / originalSize) * 100);
    
    console.log('📊 CSS Analysis Results');
    console.log('======================\n');
    console.log(`Original CSS size: ${Math.round(originalSize / 1024)} KB`);
    console.log(`Purged CSS size: ${Math.round(purgedSize / 1024)} KB`);
    console.log(`Potential savings: ${Math.round(savings / 1024)} KB (${savingsPercent}%)\n`);
    
    // Find most common unused selectors
    const unusedSelectors = [];
    const originalRules = mainCSS.match(/[^{]+{[^}]+}/g) || [];
    const purgedRules = purgeCSSResult[0].css.match(/[^{]+{[^}]+}/g) || [];
    
    console.log('💡 Recommendations:');
    console.log('==================\n');
    
    if (savingsPercent > 50) {
      console.log('1. High amount of unused CSS detected!');
      console.log('   - Review Tailwind configuration');
      console.log('   - Consider using dynamic class generation carefully');
      console.log('   - Add frequently used patterns to safelist\n');
    }
    
    console.log('2. Optimize Tailwind config:');
    console.log('   - Use `content` configuration to scan only necessary files');
    console.log('   - Enable JIT mode for on-demand generation');
    console.log('   - Remove unused variants and plugins\n');
    
    console.log('3. Consider CSS-in-JS alternatives for dynamic styles');
    console.log('   - Use style props for truly dynamic values');
    console.log('   - Avoid generating class names dynamically\n');
    
    console.log('4. Enable CSS minification in production');
    console.log('   - Already configured in postcss.config.js');
    console.log('   - Ensure NODE_ENV=production during build\n');
    
    // Write purged CSS for inspection
    const outputPath = path.join(projectDir, 'dist/css/purged-tailwind.css');
    await fs.mkdir(path.dirname(outputPath), { recursive: true }).catch(() => {});
    await fs.writeFile(outputPath, purgeCSSResult[0].css);
    console.log(`✅ Purged CSS written to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error analyzing CSS:', error);
  }
}

// Run the analysis
analyzeCSSUsage().catch(console.error);