import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';

export default {
  content: [
    './src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}',
    '!./src/**/node_modules/**',
  ],
  // Optimize for production
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        primary: '#DC2626',              // Primary red for links/CTAs (changed from blue)
        secondary: '#0B0F19',            // Ink for text
        accent: '#22C55E',               // Success highlights
        default: '#0B0F19',              // Default text color
        muted: '#64748B',                // Muted text
        // Extended red palette (replaced blue)
        'red': {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A'
        },
        'gray': {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712'
        },
        // Named colors for consistency
        'blue-primary': '#DC2626',       // Primary red (renamed from blue for compatibility)
        'ink': '#0B0F19',                // Text color
        'surface': '#FFFFFF',            // White surface
        'surface-light': '#F8FAFC',      // Light surface
        'success': '#22C55E',            // Success/accent green
        // Button colors
        'btn-primary': '#000000',        // Black for primary buttons
        'btn-secondary': '#DC2626',      // Red for secondary buttons (changed from blue)
        // Brand red colors - matching logo
        'brand-red': '#FF0000',          // Bright red to match logo
        'brand-red-light': '#FF3333',    // Light red for hover states
        'brand-red-medium': '#DC2626',   // Medium red (red-600)
        'brand-red-dark': '#991B1B',     // Dark red (red-800)
        'brand-black': '#000000',        // True black
      },
      fontFamily: {
        sans: ['Inter', 'var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['Inter', 'var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
      },

      animation: {
        fade: 'fadeInUp 1s both',
      },

      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(2rem)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    typographyPlugin,
    plugin(({ addVariant }) => {
      addVariant('intersect', '&:not([no-intersect])');
    }),
  ],
  darkMode: 'class',
};
