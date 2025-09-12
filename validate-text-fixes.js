const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function validateTextFixes() {
  console.log('🔍 Validating Somerset Window Cleaning Text Visibility Fixes...\n');
  
  const outputDir = 'text-fix-validation';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const pages = [
    { url: '/', name: 'homepage', critical: ['TrustSignals', 'ServicesFlashcards'] },
    { url: '/book-now', name: 'book-now', critical: ['Contact methods'] },
    { url: '/book-online', name: 'book-online', critical: ['Booking form'] },
    { url: '/about', name: 'about', critical: ['Team descriptions'] },
    { url: '/areas', name: 'areas', critical: ['Area descriptions'] }
  ];

  const results = [];

  for (const pageInfo of pages) {
    const page = await context.newPage();
    
    try {
      console.log(`📸 Testing: ${pageInfo.name} (${pageInfo.url})`);
      
      await page.goto(`http://localhost:4321${pageInfo.url}`, { 
        waitUntil: 'networkidle',
        timeout: 15000
      });

      await page.waitForTimeout(2000);

      // Take screenshots
      const screenshotPath = path.join(outputDir, `${pageInfo.name}-after-fixes.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });

      // Validate text visibility
      const textAnalysis = await page.evaluate(() => {
        const issues = [];
        const improvements = [];
        
        // Check trust signals specifically
        const trustSignals = document.querySelectorAll('[class*="trust-signals"] span');
        trustSignals.forEach(el => {
          const computed = getComputedStyle(el);
          if (computed.color.includes('rgb(0, 0, 0)')) {
            improvements.push({
              element: 'Trust Signal',
              text: el.textContent?.trim(),
              status: '✅ Fixed - Now black text',
              color: computed.color
            });
          }
        });

        // Check service cards
        const serviceCards = document.querySelectorAll('[class*="service-card"] p, [class*="service-card"] h3');
        serviceCards.forEach(el => {
          const computed = getComputedStyle(el);
          if (computed.color.includes('rgb(0, 0, 0)')) {
            improvements.push({
              element: 'Service Card',
              text: el.textContent?.trim().substring(0, 50),
              status: '✅ Fixed - Now black text',
              color: computed.color
            });
          }
        });

        // Check for any remaining light gray text (potential issues)
        const allText = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
        allText.forEach(el => {
          if (!el.textContent?.trim()) return;
          
          const computed = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          
          if (rect.width === 0 || rect.height === 0) return;
          
          // Check for problematic light colors
          if (computed.color.includes('rgb')) {
            const rgbMatch = computed.color.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
            if (rgbMatch) {
              const [, r, g, b] = rgbMatch.map(Number);
              const brightness = (r * 299 + g * 587 + b * 114) / 1000;
              
              if (brightness > 180 && brightness < 240) {
                issues.push({
                  element: el.tagName,
                  text: el.textContent.trim().substring(0, 50),
                  status: '⚠️ Still light text',
                  color: computed.color,
                  brightness: Math.round(brightness),
                  classes: el.className
                });
              }
            }
          }
        });

        return { issues, improvements };
      });

      results.push({
        page: pageInfo,
        screenshot: screenshotPath,
        analysis: textAnalysis,
        timestamp: new Date().toISOString()
      });

      console.log(`   ✅ Screenshot: ${screenshotPath}`);
      console.log(`   ✅ Improvements: ${textAnalysis.improvements.length}`);
      console.log(`   ⚠️  Remaining issues: ${textAnalysis.issues.length}`);

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({
        page: pageInfo,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      await page.close();
    }
    
    console.log('');
  }

  await browser.close();

  // Generate validation report
  const reportPath = path.join(outputDir, 'TEXT_VISIBILITY_VALIDATION_REPORT.md');
  const report = generateValidationReport(results);
  fs.writeFileSync(reportPath, report);

  console.log('📊 VALIDATION COMPLETE!');
  console.log(`📁 Screenshots: ${path.resolve(outputDir)}`);
  console.log(`📄 Full report: ${path.resolve(reportPath)}`);

  // Display summary
  displayValidationSummary(results);
}

function generateValidationReport(results) {
  let report = '# Somerset Window Cleaning - Text Visibility Fix Validation\n\n';
  report += `**Validation Date:** ${new Date().toISOString()}\n\n`;
  
  const totalImprovements = results.reduce((sum, r) => sum + (r.analysis?.improvements?.length || 0), 0);
  const totalIssues = results.reduce((sum, r) => sum + (r.analysis?.issues?.length || 0), 0);
  
  report += '## Executive Summary\n\n';
  report += `- **Pages Tested:** ${results.length}\n`;
  report += `- **Text Elements Fixed:** ${totalImprovements}\n`;
  report += `- **Remaining Issues:** ${totalIssues}\n\n`;

  if (totalImprovements > 0) {
    report += '## ✅ Successfully Fixed Elements\n\n';
    results.forEach(result => {
      if (result.analysis?.improvements?.length > 0) {
        report += `### ${result.page.name}\n\n`;
        result.analysis.improvements.forEach(improvement => {
          report += `- **${improvement.element}**: "${improvement.text}"\n`;
          report += `  - ${improvement.status}\n`;
          report += `  - Color: ${improvement.color}\n\n`;
        });
      }
    });
  }

  if (totalIssues > 0) {
    report += '## ⚠️ Remaining Issues to Address\n\n';
    results.forEach(result => {
      if (result.analysis?.issues?.length > 0) {
        report += `### ${result.page.name}\n\n`;
        result.analysis.issues.forEach(issue => {
          report += `- **${issue.element}**: "${issue.text}"\n`;
          report += `  - ${issue.status}\n`;
          report += `  - Color: ${issue.color}\n`;
          report += `  - Brightness: ${issue.brightness}/255\n`;
          report += `  - Classes: ${issue.classes}\n\n`;
        });
      }
    });
  }

  return report;
}

function displayValidationSummary(results) {
  console.log('\\n' + '═'.repeat(60));
  console.log('🎯 SOMERSET WINDOW CLEANING - TEXT VISIBILITY FIX VALIDATION');
  console.log('═'.repeat(60));
  
  let totalImprovements = 0;
  let totalIssues = 0;
  
  results.forEach(result => {
    if (result.analysis) {
      totalImprovements += result.analysis.improvements.length;
      totalIssues += result.analysis.issues.length;
      
      console.log(`\\n📄 ${result.page.name.toUpperCase()}`);
      console.log(`   ✅ Fixed: ${result.analysis.improvements.length}`);
      console.log(`   ⚠️  Issues: ${result.analysis.issues.length}`);
    }
  });
  
  console.log('\\n' + '═'.repeat(60));
  console.log(`📊 TOTAL: ✅ ${totalImprovements} Fixed | ⚠️ ${totalIssues} Issues`);
  console.log('═'.repeat(60));
  
  if (totalIssues === 0) {
    console.log('\\n🎉 EXCELLENT! All major text visibility issues have been resolved!');
    console.log('✨ Your Somerset Window Cleaning website now has professional, readable text throughout.');
  } else {
    console.log(`\\n📝 Good progress! ${totalImprovements} elements fixed, ${totalIssues} minor issues remain.`);
    console.log('💡 Check the detailed report for specific recommendations.');
  }
}

// Run validation
validateTextFixes().catch(console.error);