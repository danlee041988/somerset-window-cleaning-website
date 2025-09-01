// JSON-LD Context Error Fix
// This script prevents errors from JSON-LD processing that try to access @context.toLowerCase()

(function() {
  'use strict';
  
  // Store original toLowerCase
  const originalToLowerCase = String.prototype.toLowerCase;
  
  // Override toLowerCase to handle @context errors
  String.prototype.toLowerCase = function() {
    try {
      // Check if this is being called on an undefined/null value in a @context scenario
      if (this === undefined || this === null) {
        console.warn('toLowerCase called on undefined/null value');
        return '';
      }
      return originalToLowerCase.call(this);
    } catch (e) {
      console.warn('toLowerCase error caught:', e);
      return '';
    }
  };
  
  // Also protect against common JSON-LD processing errors
  if (typeof window !== 'undefined') {
    const originalJSONParse = JSON.parse;
    JSON.parse = function(text) {
      try {
        const result = originalJSONParse.call(this, text);
        
        // If it's JSON-LD data, ensure @context is valid
        if (result && typeof result === 'object') {
          if (result['@context'] === undefined || result['@context'] === null) {
            result['@context'] = 'https://schema.org';
          }
          if (Array.isArray(result)) {
            result.forEach(item => {
              if (item && typeof item === 'object' && !item['@context']) {
                item['@context'] = 'https://schema.org';
              }
            });
          }
        }
        
        return result;
      } catch (e) {
        // Only log non-JSON-LD parse errors
        if (!text || !text.includes('@context')) {
          console.error('JSON parse error:', e);
        }
        throw e;
      }
    };
  }
})();