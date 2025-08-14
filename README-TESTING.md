# Somerset Window Cleaning - Testing Infrastructure

This document describes the comprehensive end-to-end testing infrastructure for the Somerset Window Cleaning website.

## Overview

The testing suite includes:
- **End-to-End Tests**: Full user journey testing with Playwright
- **Cross-Browser Testing**: Chrome, Firefox, Safari compatibility
- **Mobile Responsiveness**: Tests across multiple device sizes
- **Link Validation**: Automated crawling and broken link detection
- **Performance Testing**: Core Web Vitals and loading time monitoring
- **Visual Regression**: Screenshot comparison testing
- **Accessibility Testing**: WCAG compliance validation
- **CI/CD Integration**: Automated testing in GitHub Actions

## Quick Start

### Prerequisites

Ensure you have Node.js 18+ installed and the development server running:

```bash
npm install
npm run dev  # Start development server at localhost:4321
```

### Install Testing Dependencies

```bash
npm run test:install  # Install Playwright browsers
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:links          # Link validation
npm run test:performance    # Performance tests
npm run test:visual         # Visual regression
npm run test:mobile         # Mobile responsiveness
npm run test:cross-browser  # Cross-browser compatibility

# Interactive testing
npm run test:ui             # Open Playwright UI
npm run test:headed         # Run with browser visible
npm run test:debug          # Debug mode
```

## Test Structure

```
tests/
├── pages/              # Page Object Models
│   ├── base-page.ts
│   ├── home-page.ts
│   ├── contact-page.ts
│   ├── services-page.ts
│   └── about-page.ts
├── specs/              # Test specifications
│   ├── navigation.spec.ts
│   ├── home-page.spec.ts
│   ├── contact-form.spec.ts
│   ├── postcode-checker.spec.ts
│   ├── responsive.spec.ts
│   ├── cross-browser.spec.ts
│   ├── link-validation.spec.ts
│   ├── performance.spec.ts
│   └── visual-regression.spec.ts
└── utils/              # Testing utilities
    ├── test-helpers.ts
    └── link-crawler.ts
```

## Test Categories

### 1. Navigation Tests (`navigation.spec.ts`)
- Tests all main page navigation
- Validates menu functionality
- Checks mobile menu behavior
- Verifies 404 handling
- Ensures no console errors

### 2. Home Page Tests (`home-page.spec.ts`)
- Hero section functionality
- All content sections display correctly
- Call-to-action buttons work
- Service listings are complete
- Customer testimonials load
- FAQ section is interactive

### 3. Contact Form Tests (`contact-form.spec.ts`)
- Form field validation
- Required field checking
- Email format validation
- Property type and frequency selection
- Additional services checkboxes
- Form submission handling

### 4. Postcode Checker Tests (`postcode-checker.spec.ts`)
- Validates postcode format checking
- Tests covered postcodes (BA, TA, BS, DT9)
- Tests non-covered postcode handling
- Checks URL parameter handling
- Validates confetti animation
- Tests auto-scroll behavior

### 5. Responsive Design Tests (`responsive.spec.ts`)
- Tests across multiple viewport sizes
- Mobile menu functionality
- Touch interaction handling
- Image scaling verification
- Layout integrity checks
- Orientation change handling

### 6. Cross-Browser Tests (`cross-browser.spec.ts`)
- Chrome, Firefox, Safari compatibility
- CSS rendering consistency
- JavaScript functionality
- Form behavior across browsers
- Font loading and display

### 7. Link Validation Tests (`link-validation.spec.ts`)
- Comprehensive site crawling
- Internal link validation
- External link checking
- Asset loading verification (images, CSS, JS)
- Phone and email link validation
- WhatsApp link verification

### 8. Performance Tests (`performance.spec.ts`)
- Page load time measurement
- Core Web Vitals monitoring
- Bundle size validation
- Image optimization checking
- Concurrent user simulation
- Memory usage monitoring

### 9. Visual Regression Tests (`visual-regression.spec.ts`)
- Full page screenshots
- Section-specific comparisons
- Mobile vs desktop layouts
- Cross-browser visual consistency
- Dark mode support (if available)
- Error state captures

## Configuration

### Playwright Configuration (`playwright.config.ts`)

The configuration includes:
- **Multiple browsers**: Chrome, Firefox, Safari
- **Device testing**: Mobile phones, tablets, desktops
- **Parallel execution**: Tests run concurrently for speed
- **Automatic retries**: Failed tests retry automatically
- **Rich reporting**: HTML, JSON, and JUnit reports
- **Screenshots/Videos**: Captured on failure
- **Trace collection**: For debugging failed tests

### Browser Projects
- **Desktop Chrome**: Primary testing browser
- **Desktop Firefox**: Cross-browser compatibility
- **Desktop Safari**: WebKit engine testing
- **Mobile Chrome**: Android mobile simulation
- **Mobile Safari**: iOS mobile simulation
- **iPad**: Tablet viewport testing

## Page Object Model

The testing infrastructure uses the Page Object Model pattern for maintainable test code:

### BasePage
- Common page elements (header, footer, navigation)
- Shared functionality across all pages
- Screenshot and accessibility helpers

### HomePage
- Hero section interactions
- Service section validation
- CTA button testing
- Content verification methods

### ContactPage
- Form field interactions
- Postcode checker functionality
- Validation error handling
- Contact method verification

## Test Data Management

Tests use realistic but non-personal data:
```typescript
const testData = {
  fullName: 'John Smith',
  email: 'john.smith@example.com',
  phone: '07123456789',
  address: '123 Test Street, Test Town',
  postcode: 'BA6 8AB',
  propertyType: 'Semi-detached (3 bed)',
  frequency: 'Every 4 weeks'
};
```

## CI/CD Integration

### GitHub Actions Workflow (`.github/workflows/e2e-tests.yml`)

The automated testing pipeline includes:

1. **Multi-Node Testing**: Tests across Node.js 18.x and 20.x
2. **Browser Matrix**: All browsers tested in parallel
3. **Lighthouse Audits**: Performance and accessibility scoring
4. **Security Scanning**: npm audit and vulnerability checking
5. **Visual Regression**: PR-based screenshot comparison
6. **Deploy Previews**: Netlify preview deployments for PRs

### Quality Gates

Tests will fail the build if:
- Any internal links are broken (404s)
- Console errors are detected
- Performance thresholds are exceeded
- Accessibility scores fall below 90%
- Visual regressions are detected
- Form functionality is broken

## Reports and Artifacts

### Test Reports
- **HTML Report**: Interactive test results with screenshots
- **JSON Report**: Machine-readable test data
- **JUnit Report**: CI/CD integration format

### Performance Reports
- **Lighthouse Reports**: Performance, accessibility, SEO scores
- **Core Web Vitals**: LCP, FID, CLS measurements
- **Load Time Analysis**: Page-by-page performance data

### Link Validation Reports
- **Comprehensive Link Analysis**: All discovered links
- **Broken Link Details**: Status codes and error messages
- **Response Time Metrics**: Link performance data

### Visual Regression Reports
- **Screenshot Comparisons**: Before/after visual diffs
- **Cross-Browser Consistency**: Visual differences between browsers
- **Mobile vs Desktop**: Layout comparison reports

## Local Development

### Running Tests During Development

```bash
# Quick smoke test
npm run test:links

# Test current changes
npm run test:headed

# Debug specific test
npm run test:debug -- --grep "postcode checker"

# Update visual baselines
npm run test:visual -- --update-snapshots
```

### Debugging Failed Tests

1. **Use headed mode**: `npm run test:headed` to see browser actions
2. **Enable debug mode**: `npm run test:debug` for step-by-step debugging
3. **Check screenshots**: Look in `test-results/` for failure screenshots
4. **Review traces**: Use `npx playwright show-trace` for detailed failure analysis

## Best Practices

### Writing Tests
- Use Page Object Models for reusability
- Include data-testid attributes for reliable element selection
- Test user journeys, not just individual features
- Handle loading states and animations properly
- Use Playwright's built-in waiting mechanisms

### Test Maintenance
- Update visual baselines when UI changes are intentional
- Review and update test data regularly
- Monitor test execution times and optimize slow tests
- Keep test dependencies up to date

### Performance Considerations
- Tests run in parallel for speed
- Use appropriate timeouts for different operations
- Mock external services when necessary
- Optimize test data and fixtures

## Troubleshooting

### Common Issues

**Tests failing locally but passing in CI**
- Check Node.js version consistency
- Ensure browser versions match CI environment
- Verify environment variables and configuration

**Visual regression false positives**
- Check for dynamic content that changes between runs
- Verify font loading consistency
- Consider animation timing differences

**Performance test failures**
- Network conditions may affect results
- Consider system resource availability
- Check for background processes affecting performance

**Link validation failures**
- External links may be temporarily unavailable
- Check for rate limiting or blocking
- Verify internal routing and redirects

### Getting Help

1. Check the test output for specific error messages
2. Review the HTML report for detailed failure information
3. Look at screenshots and traces for visual debugging
4. Check CI logs for environment-specific issues

## Maintenance Schedule

- **Daily**: Automated test runs via GitHub Actions
- **Weekly**: Review test performance and update thresholds
- **Monthly**: Update dependencies and browser versions
- **Per Release**: Update visual baselines and test data

This testing infrastructure ensures the Somerset Window Cleaning website maintains high quality, performance, and reliability across all user interactions and devices.