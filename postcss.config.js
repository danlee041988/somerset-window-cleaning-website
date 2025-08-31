import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

// Only add PurgeCSS in production to avoid issues during development
const isProduction = process.env.NODE_ENV === 'production';

export default {
  plugins: [
    // Add vendor prefixes automatically
    autoprefixer(),
    
    // Minify CSS in production
    isProduction && cssnano({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        // Optimize for better compression
        normalizeWhitespace: true,
        // Convert colors to shorter values when possible
        colormin: true,
        // Optimize font-weight values
        minifyFontValues: true,
        // Optimize calc() expressions
        calc: true,
        // Merge adjacent rules
        mergeRules: true,
        // Merge longhand properties
        mergeLonghand: true,
        // Discard duplicates
        discardDuplicates: true,
        // Optimize z-index values
        zindex: false, // Keep original z-index values for maintainability
      }]
    }),
  ].filter(Boolean)
};