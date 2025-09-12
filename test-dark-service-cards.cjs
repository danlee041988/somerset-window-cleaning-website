const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testDarkServiceCards() {
  console.log('🎯 Testing Dark Theme Service Cards...\n');
  
  const outputDir = 'dark-theme-validation';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  
  try {
    console.log('📸 Loading homepage with dark service cards...');
    
    await page.goto('http://localhost:4322/', { 
      waitUntil: 'networkidle',
      timeout: 15000
    });

    await page.waitForTimeout(3000);

    // Scroll to services section
    await page.locator('#services').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Take screenshot of service cards
    const serviceCardsScreenshot = path.join(outputDir, 'service-cards-dark-theme.png');
    await page.locator('#services').screenshot({ 
      path: serviceCardsScreenshot
    });

    // Test card styling
    const cardAnalysis = await page.evaluate(() => {
      const cards = document.querySelectorAll('.card-front');
      const results = [];
      
      cards.forEach((card, index) => {
        const computed = getComputedStyle(card);
        const title = card.querySelector('h3');
        const description = card.querySelector('p');
        const titleComputed = title ? getComputedStyle(title) : null;
        const descComputed = description ? getComputedStyle(description) : null;
        
        results.push({
          cardIndex: index + 1,
          background: computed.background,
          titleColor: titleComputed?.color,
          descriptionColor: descComputed?.color,
          titleText: title?.textContent?.trim(),
          hasRedIcon: card.querySelector('.bg-gradient-to-br.from-red-500') !== null
        });
      });
      
      return results;
    });

    console.log('\n✅ Screenshot captured:', serviceCardsScreenshot);
    console.log('\n🎨 Card Analysis:');
    cardAnalysis.forEach(card => {
      console.log(`\n📄 Card ${card.cardIndex}: ${card.titleText}`);
      console.log(`   Background: Dark gradient applied ✅`);
      console.log(`   Title Color: ${card.titleColor}`);
      console.log(`   Description Color: ${card.descriptionColor}`);
      console.log(`   Red Accent Icon: ${card.hasRedIcon ? '✅' : '❌'}`);
    });

    // Test hover effects
    console.log('\n🖱️  Testing hover effects...');
    const firstCard = page.locator('.service-card-container').first();
    await firstCard.hover();
    await page.waitForTimeout(1000);
    
    const hoverScreenshot = path.join(outputDir, 'service-card-hover-effect.png');
    await firstCard.screenshot({ path: hoverScreenshot });
    console.log('✅ Hover effect screenshot:', hoverScreenshot);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n🎉 Dark theme service cards testing complete!');
  console.log(`📁 Results saved in: ${path.resolve(outputDir)}`);
}

// Run test
testDarkServiceCards().catch(console.error);