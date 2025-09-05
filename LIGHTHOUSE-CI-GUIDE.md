# 🔍 Lighthouse CI Setup Guide

## Overview

Lighthouse CI automatically monitors your website's performance, accessibility, SEO, and best practices on every pull request and deployment. This ensures your Somerset Window Cleaning website maintains high quality standards and optimal user experience.

## 📊 What We Monitor

### Performance Targets
- **Performance Score**: 85+ (critical for conversions)
- **Largest Contentful Paint**: < 3000ms (hero image loading)
- **First Contentful Paint**: < 2000ms (perceived speed)
- **Cumulative Layout Shift**: < 0.1 (visual stability)
- **Speed Index**: < 3500ms (overall loading speed)

### Accessibility Targets  
- **Accessibility Score**: 95+ (WCAG 2.1 AA compliance)
- **Color Contrast**: Error on violations
- **Form Labels**: Error on missing labels
- **Focus Management**: Error on focus issues
- **Touch Targets**: Error on targets < 44px

### SEO & Best Practices
- **SEO Score**: 90+ (local business rankings)
- **Meta Descriptions**: Required
- **Page Titles**: Required  
- **Canonical URLs**: Validated
- **Mobile Viewport**: Required

## 🚀 Quick Start

### 1. Install Lighthouse CI
```bash
npm run lighthouse:install
```

### 2. Run Local Audit (Development)
```bash
# Start dev server
npm run dev

# In another terminal, run lighthouse
npm run lighthouse:dev
```

### 3. Run Full Build Audit
```bash
npm run lighthouse:build
```

## 🔧 Configuration

### Lighthouse RC Configuration (`lighthouserc.json`)
- **Pages Tested**: Homepage, Services, Booking, About, Individual Service pages
- **Runs Per Test**: 3 (for consistency)
- **Assertions**: Custom thresholds for SWC business needs
- **Storage**: Temporary public storage for PR comments

### GitHub Actions Workflow
- **Triggers**: Pull requests, main branch pushes, manual runs
- **Environment**: Ubuntu latest with Node 20
- **Artifacts**: Results uploaded for historical tracking
- **PR Comments**: Automated score reporting

## 📈 Understanding Results

### Score Ranges
- **🟢 90-100**: Excellent (target range)
- **🟡 50-89**: Needs improvement  
- **🔴 0-49**: Poor (requires immediate attention)

### Business Impact Indicators
- **Performance < 85**: May impact booking conversion rates
- **Accessibility < 95**: Risk of WCAG compliance issues
- **LCP > 3000ms**: Slow hero loading may lose customers
- **CLS > 0.1**: Layout shifts impact user experience

## 🛠️ Troubleshooting

### Common Issues

**Performance Too Low:**
- Check hero image optimization
- Review JavaScript bundle size
- Analyze third-party scripts
- Monitor server response times

**Accessibility Failures:**
- Verify form labels are present
- Check color contrast ratios
- Ensure proper heading hierarchy
- Test keyboard navigation

**SEO Issues:**
- Add missing meta descriptions
- Fix duplicate titles
- Verify canonical URLs
- Check mobile viewport settings

### Local Development Tips

```bash
# Run on specific URL
npx lhci autorun --collect.url=http://localhost:4321/services

# Generate detailed report
npx lhci autorun --collect.staticDistDir=./dist

# View results in browser
npx lhci open
```

## 📋 Maintenance

### Weekly Tasks
- [ ] Review Lighthouse scores in latest PRs
- [ ] Check for performance regressions
- [ ] Monitor Core Web Vitals trends
- [ ] Update target thresholds if needed

### Monthly Tasks  
- [ ] Analyze historical performance data
- [ ] Update lighthouse configuration
- [ ] Review accessibility compliance
- [ ] Benchmark against competitors

### Red Flags (Immediate Action Required)
- Performance score drops below 80
- Accessibility score drops below 90
- LCP exceeds 4000ms
- Multiple failing assertions

## 🎯 Somerset Window Cleaning Specific Monitoring

### Critical Pages for Business
1. **Homepage** (`/`) - First impression, hero performance
2. **Services** (`/services`) - Service discovery, information architecture  
3. **Booking** (`/book-now`) - Conversion critical, form performance
4. **Individual Services** - Local SEO, detailed information

### Key Metrics for Conversions
- **Hero Image LCP**: Impacts bounce rate
- **Form Interactivity**: Booking completion rates
- **Mobile Performance**: Majority of traffic
- **Accessibility**: Legal compliance + broader reach

### SEO Focus Areas
- **Local Business Schema**: Structured data compliance
- **Page Titles**: Local SEO optimization
- **Meta Descriptions**: SERP click-through rates
- **Mobile Usability**: Google ranking factor

## 🚀 Getting Started

1. **Review Current Scores**: Check the first lighthouse run results
2. **Set Realistic Targets**: Start with current scores + 5-10 points
3. **Monitor Trends**: Focus on improvements over time
4. **Address Failures**: Fix any red-flagged items immediately
5. **Celebrate Wins**: Acknowledge performance improvements

---

**Remember**: Lighthouse CI helps maintain the professional quality your customers expect from Somerset Window Cleaning. High scores = better user experience = more bookings! 📈