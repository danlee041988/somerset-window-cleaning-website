// Image loading enhancement script
(function() {
  'use strict';
  
  // Add loaded class to images when they finish loading
  function handleImageLoad(img) {
    img.classList.add('loaded');
    
    // Remove any skeleton loader if present
    const wrapper = img.closest('.image-wrapper, .fade-in-image-wrapper');
    if (wrapper) {
      const skeleton = wrapper.querySelector('.skeleton, .skeleton-loader');
      if (skeleton) {
        setTimeout(() => {
          skeleton.style.opacity = '0';
          setTimeout(() => {
            skeleton.style.display = 'none';
          }, 300);
        }, 100);
      }
    }
  }
  
  // Check if image is already loaded (cached)
  function checkImage(img) {
    if (img.complete && img.naturalHeight !== 0) {
      handleImageLoad(img);
    } else {
      img.addEventListener('load', () => handleImageLoad(img), { once: true });
      img.addEventListener('error', () => {
        img.style.opacity = '0.5';
        img.classList.add('error');
      }, { once: true });
    }
  }
  
  // Process all images on page
  function processImages() {
    const images = document.querySelectorAll('img[loading="lazy"], img.fade-in-image');
    images.forEach(checkImage);
  }
  
  // Use Intersection Observer for better performance
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Load image if it has data-src
          if (img.dataset.src && !img.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // Check if loaded
          checkImage(img);
          
          // Stop observing
          imageObserver.unobserve(img);
        }
      });
    }, {
      // Start loading 50px before entering viewport
      rootMargin: '50px',
      threshold: 0.01
    });
    
    // Observe all lazy images
    document.addEventListener('DOMContentLoaded', () => {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyImages.forEach((img) => {
        imageObserver.observe(img);
      });
    });
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processImages);
  } else {
    processImages();
  }
  
  // Also run on dynamic content changes
  if (window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const images = mutation.target.querySelectorAll('img[loading="lazy"]:not(.loaded)');
          images.forEach(checkImage);
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();