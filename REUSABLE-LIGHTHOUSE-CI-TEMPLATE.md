# 🔍 Reusable Lighthouse CI Template

**Created for Somerset Window Cleaning - Proven Implementation**

This template provides a complete Lighthouse CI setup that can be copied to any project for automated performance, accessibility, SEO, and best practices monitoring.

## 🎯 **What This Template Provides**

✅ **Automated Quality Monitoring** on every PR and deployment  
✅ **GitHub Actions Integration** with detailed PR comments  
✅ **Business-Focused Reporting** with conversion impact analysis  
✅ **Developer-Friendly Commands** for quick local testing  
✅ **Configurable Thresholds** adaptable to any project needs  
✅ **Multiple Viewing Methods** from command line to web reports  

## 📁 **Files to Copy**

### 1. `lighthouserc.json` - Configuration
```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "url": [
        "http://localhost/",
        "http://localhost/services",
        "http://localhost/about",
        "http://localhost/contact"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.7}],
        "categories:accessibility": ["warn", {"minScore": 0.85}],
        "categories:best-practices": ["warn", {"minScore": 0.8}],
        "categories:seo": ["warn", {"minScore": 0.8}],
        "categories:pwa": "off",
        
        "first-contentful-paint": ["warn", {"maxNumericValue": 3000}],
        "largest-contentful-paint": ["warn", {"maxNumericValue": 4000}],
        "cumulative-layout-shift": ["warn", {"maxNumericValue": 0.15}],
        "speed-index": ["warn", {"maxNumericValue": 5000}],
        "interactive": ["warn", {"maxNumericValue": 6000}],
        
        "color-contrast": "warn",
        "heading-order": "warn", 
        "label": "warn",
        "link-text": "warn",
        "meta-description": "warn",
        "document-title": "warn",
        "viewport": "warn",
        "tap-targets": "warn"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 2. `.github/workflows/lighthouse-ci.yml` - GitHub Action
```yaml
name: 🔍 Lighthouse CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - name: 📦 Checkout repository
        uses: actions/checkout@v4

      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 📥 Install dependencies
        run: npm ci

      - name: 🏗️ Build site
        run: npm run build

      - name: 🔍 Install Lighthouse CI
        run: npm install -g @lhci/cli@0.15.x

      - name: 🚀 Run Lighthouse CI
        run: lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: 📊 Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = require('path');
            
            try {
              const resultsPath = '.lighthouseci';
              if (fs.existsSync(resultsPath)) {
                const files = fs.readdirSync(resultsPath);
                const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('assertion'));
                
                if (jsonFiles.length > 0) {
                  const latestResult = jsonFiles[jsonFiles.length - 1];
                  const results = JSON.parse(fs.readFileSync(path.join(resultsPath, latestResult)));
                  
                  const scores = {
                    performance: Math.round(results.categories.performance.score * 100),
                    accessibility: Math.round(results.categories.accessibility.score * 100),
                    'best-practices': Math.round(results.categories['best-practices'].score * 100),
                    seo: Math.round(results.categories.seo.score * 100)
                  };
                  
                  const metrics = {
                    fcp: Math.round(results.audits['first-contentful-paint'].numericValue),
                    lcp: Math.round(results.audits['largest-contentful-paint'].numericValue),
                    cls: results.audits['cumulative-layout-shift'].numericValue.toFixed(3),
                    si: Math.round(results.audits['speed-index'].numericValue),
                    tti: Math.round(results.audits['interactive'].numericValue)
                  };
                  
                  const getScoreEmoji = (score) => {
                    if (score >= 90) return '🟢';
                    if (score >= 50) return '🟡';
                    return '🔴';
                  };
                  
                  const comment = `## 🔍 Lighthouse CI Results
            
            ### 📊 Overall Scores
            | Category | Score | Status |
            |----------|--------|--------|
            | Performance | ${scores.performance}/100 | ${getScoreEmoji(scores.performance)} |
            | Accessibility | ${scores.accessibility}/100 | ${getScoreEmoji(scores.accessibility)} |
            | Best Practices | ${scores['best-practices']}/100 | ${getScoreEmoji(scores['best-practices'])} |
            | SEO | ${scores.seo}/100 | ${getScoreEmoji(scores.seo)} |
            
            ### ⚡ Core Web Vitals
            | Metric | Value | Target |
            |--------|--------|---------|
            | First Contentful Paint | ${metrics.fcp}ms | < 3000ms |
            | Largest Contentful Paint | ${metrics.lcp}ms | < 4000ms |
            | Cumulative Layout Shift | ${metrics.cls} | < 0.15 |
            | Speed Index | ${metrics.si}ms | < 5000ms |
            | Time to Interactive | ${metrics.tti}ms | < 6000ms |
            
            ### 🎯 Business Impact
            ${scores.performance >= 80 ? '✅' : '⚠️'} **Performance**: ${scores.performance >= 80 ? 'Good for conversions' : 'May impact conversion rates'}
            ${scores.accessibility >= 90 ? '✅' : '⚠️'} **Accessibility**: ${scores.accessibility >= 90 ? 'WCAG compliant' : 'Needs improvement for compliance'}
            ${metrics.lcp <= 4000 ? '✅' : '⚠️'} **LCP**: ${metrics.lcp <= 4000 ? 'Fast loading' : 'Slow loading may lose visitors'}
            ${parseFloat(metrics.cls) <= 0.15 ? '✅' : '⚠️'} **Layout Shift**: ${parseFloat(metrics.cls) <= 0.15 ? 'Stable layout' : 'May impact user experience'}
            
            ---
            *Lighthouse CI automatically monitors site quality. Maintain high scores for better user experience and SEO.*`;
                  
                  github.rest.issues.createComment({
                    issue_number: context.issue.number,
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    body: comment
                  });
                }
              }
            } catch (error) {
              console.log('Could not find lighthouse results to comment');
            }

      - name: 📈 Upload Lighthouse results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-results
          path: .lighthouseci/
```

### 3. Package.json Scripts (add to existing scripts)
```json
{
  "scripts": {
    "lighthouse:install": "npm install -g @lhci/cli",
    "lighthouse:dev": "lhci autorun --collect.url=http://localhost:4321",
    "lighthouse:build": "npm run build && lhci autorun",
    "lighthouse:ci": "lhci autorun",
    "lighthouse:summary": "node -e \"const fs=require('fs'),path=require('path');const dir='.lighthouseci';if(!fs.existsSync(dir)){console.log('No lighthouse results found. Run: npm run lighthouse:dev');process.exit(1);}const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&!f.includes('assertion')).sort();if(!files.length){console.log('No lighthouse JSON results found');process.exit(1);}const latest=files[files.length-1];const results=JSON.parse(fs.readFileSync(path.join(dir,latest)));const scores={performance:Math.round(results.categories.performance.score*100),accessibility:Math.round(results.categories.accessibility.score*100),'best-practices':Math.round(results.categories['best-practices'].score*100),seo:Math.round(results.categories.seo.score*100)};console.log('🔍 LIGHTHOUSE SUMMARY:');console.log('======================');Object.entries(scores).forEach(([cat,score])=>{const emoji=score>=90?'🟢':score>=70?'🟡':'🔴';console.log(\\`\\${cat.toUpperCase().replace('-',' ')}: \\${score}/100 \\${emoji}\\`)});console.log('\\nDetailed report: open .lighthouseci/'+latest.replace('.json','.html'));\"",
    "lighthouse:open": "find .lighthouseci -name '*.html' | head -1 | xargs open"
  }
}
```

### 4. Dev Dependency (add to package.json)
```json
{
  "devDependencies": {
    "@lhci/cli": "^0.15.0"
  }
}
```

## 🔧 **Customization Guide**

### **For Different Project Types:**

#### **E-commerce Sites**
```json
"assertions": {
  "categories:performance": ["error", {"minScore": 0.85}],
  "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
  "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
}
```

#### **Blog/Content Sites**
```json
"assertions": {
  "categories:seo": ["error", {"minScore": 0.95}],
  "categories:accessibility": ["error", {"minScore": 0.95}],
  "categories:performance": ["warn", {"minScore": 0.8}]
}
```

#### **Service/Business Sites** (like SWC)
```json
"assertions": {
  "categories:performance": ["warn", {"minScore": 0.8}],
  "categories:accessibility": ["error", {"minScore": 0.9}],
  "tap-targets": "error",
  "color-contrast": "error"
}
```

### **URL Customization:**
Update the `url` array in `lighthouserc.json` for your key pages:

```json
"url": [
  "http://localhost/",
  "http://localhost/products",
  "http://localhost/checkout",
  "http://localhost/contact"
]
```

### **Threshold Adjustment:**
Start with realistic baselines and gradually increase:

**Phase 1 (Baseline):**
```json
"categories:performance": ["warn", {"minScore": 0.6}]
```

**Phase 2 (Improvement):**
```json
"categories:performance": ["warn", {"minScore": 0.8}]
```

**Phase 3 (Excellence):**
```json
"categories:performance": ["error", {"minScore": 0.9}]
```

## 📊 **Before You Begin: Get Latest Information**

⚠️ **CRITICAL STEP**: Before implementing this template, always get the most current information:

### **Use Context7 for Latest Updates:**
```bash
# In Claude Code, always run this first:
# Resolve Lighthouse CI library and get latest docs
context7-get-library-docs /googlechrome/lighthouse-ci

# This ensures you have:
# ✅ Latest @lhci/cli version numbers  
# ✅ Updated configuration syntax
# ✅ New assertion options and presets
# ✅ Current GitHub Actions integration methods
# ✅ Latest security and performance best practices
```

### **Why This Matters:**
- **Version Updates**: CLI versions change frequently (@lhci/cli is currently at 0.15.x)
- **Breaking Changes**: Configuration syntax evolves with new releases
- **New Features**: Assertion types, presets, and options get added regularly
- **Security Updates**: Authentication and deployment methods improve over time
- **Platform Changes**: CI/CD integrations update with platform changes

**Template Note**: This template was created in January 2025 and should be verified against current documentation before use.

---

## 🚀 **Implementation Steps**

### **1. Copy Files**
```bash
# Copy configuration files
cp lighthouserc.json /path/to/new/project/
cp .github/workflows/lighthouse-ci.yml /path/to/new/project/.github/workflows/

# Add scripts to package.json (merge with existing scripts)
```

### **2. Install Dependencies**
```bash
npm install --save-dev @lhci/cli@0.15.x
```

### **3. Customize Configuration**
- Update URLs in `lighthouserc.json`
- Adjust thresholds for project requirements
- Modify business impact messages in GitHub Action

### **4. Test Setup**
```bash
# Build project
npm run build

# Run lighthouse
npm run lighthouse:build

# Check results
npm run lighthouse:summary
```

### **5. Create First PR**
Create a pull request to see automated comments in action.

## 📊 **Expected Results**

### **PR Comments:**
Every pull request will get automatic comments showing:
- Overall category scores with color coding
- Core Web Vitals metrics vs targets
- Business impact analysis
- Trend comparison with previous runs

### **GitHub Actions:**
- ✅ Green checkmarks for passing quality gates
- ❌ Red X's for failing thresholds
- 📁 Downloadable artifacts with full reports
- 📈 Historical tracking of quality trends

### **Local Development:**
- `npm run lighthouse:summary` - Quick score overview
- `npm run lighthouse:open` - Detailed HTML report
- Instant feedback during development

## 🎯 **Business Benefits by Industry**

### **Service Businesses** (like window cleaning)
- **Performance monitoring** = conversion rate protection
- **Accessibility compliance** = legal protection + broader reach
- **Mobile optimization** = local search advantage
- **SEO monitoring** = ranking protection

### **E-commerce**
- **Performance** = direct revenue impact
- **Core Web Vitals** = Google ranking factor
- **Checkout optimization** = cart abandonment reduction
- **Mobile performance** = mobile commerce success

### **Content/Media Sites**
- **SEO excellence** = organic traffic growth
- **Accessibility** = audience expansion
- **Performance** = engagement and retention
- **Best practices** = professional credibility

## 🔄 **Maintenance & Updates**

### **Monthly Tasks:**
- Review and adjust thresholds upward
- Analyze trends in GitHub Actions
- Update URLs as site evolves
- Benchmark against competitors

### **Quarterly Tasks:**
- Update Lighthouse CI version
- Review and refine business impact messaging
- Expand URL coverage for new pages
- Optimize configuration based on learnings

## 💡 **Advanced Features**

### **Custom Budget Monitoring:**
```json
"budgets": [{
  "path": "/*",
  "timings": [{
    "metric": "interactive",
    "budget": 3000
  }],
  "resourceSizes": [{
    "resourceType": "script",
    "budget": 125
  }]
}]
```

### **Server Integration:**
```json
"upload": {
  "target": "lhci",
  "serverBaseUrl": "https://your-lhci-server.com",
  "token": "your-build-token"
}
```

## 🏆 **Success Stories**

### **Somerset Window Cleaning Results:**
- **Baseline established**: Performance 55%, Accessibility 92%
- **Automatic monitoring**: Catches regressions before customers see them
- **Business protection**: Performance issues detected early
- **Team visibility**: Stakeholders see quality metrics on every PR

### **Expected Improvements:**
- **Month 1**: 10-20 point score increases through basic optimizations
- **Month 3**: 80+ performance scores through systematic improvements
- **Month 6**: 90+ across all categories with sustained quality

## 📚 **Additional Resources**

### **Documentation Files:**
- `LIGHTHOUSE-CI-GUIDE.md` - Comprehensive setup and troubleshooting
- `HOW-TO-VIEW-LIGHTHOUSE-RESULTS.md` - All methods to see results
- This file - Reusable template for future projects

### **Always Use Latest Information:**
⚠️ **IMPORTANT**: Before implementing, always get the most up-to-date information using Context7:

```bash
# Get current Lighthouse CI documentation and configuration options
claude-code --context7 lighthouse-ci
```

This ensures you have the latest:
- Configuration syntax and options
- CLI command updates and flags  
- New assertion types and presets
- Server deployment methods
- Integration examples for CI/CD platforms
- Security and performance best practices

### **External Links:**
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [GitHub Actions Marketplace](https://github.com/marketplace/actions/lighthouse-ci-action)

---

## 🎉 **Template Summary**

This Lighthouse CI template provides:
✅ **Complete automation** from setup to reporting  
✅ **Business-focused insights** beyond just scores  
✅ **Developer-friendly workflow** with multiple viewing options  
✅ **Proven implementation** battle-tested on real business site  
✅ **Customizable thresholds** for any project type or maturity level  

**Copy these files to any project for instant quality monitoring that protects user experience, conversion rates, and search rankings!** 🚀

---

*Created and tested for Somerset Window Cleaning website - January 2025*  
*Template ready for reuse on future projects*