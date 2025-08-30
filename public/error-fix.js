// Error fix for development
window.addEventListener('error', (e) => {
  // Ignore font loading errors in development
  if (e.message && e.message.includes('woff2')) {
    e.preventDefault();
    console.warn('Font loading error ignored in development');
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  // Ignore view transition errors
  if (e.reason && e.reason.message && e.reason.message.includes('skipTransition')) {
    e.preventDefault();
    console.warn('View transition error ignored');
  }
});