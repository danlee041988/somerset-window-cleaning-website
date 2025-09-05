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
        primary: '#2563EB',              // Primary blue for links/CTAs
        secondary: '#0B0F19',            // Ink for text
        accent: '#22C55E',               // Success highlights
        default: '#0B0F19',              // Default text color
        muted: '#64748B',                // Muted text
        // Extended Material Design palette with depth
        'blue': {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554'
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
        'blue-primary': '#2563EB',       // Primary blue
        'ink': '#0B0F19',                // Text color
        'surface': '#FFFFFF',            // White surface
        'surface-light': '#F8FAFC',      // Light surface
        'success': '#22C55E',            // Success/accent green
        // Button colors
        'btn-primary': '#000000',        // Black for primary buttons
        'btn-secondary': '#2563EB',      // Blue for secondary buttons
        // Legacy compatibility (will be phased out)
        'brand-red': '#2563EB',          // Map to blue now
        'brand-red-medium': '#64748B',   // Map to muted
        'brand-red-dark': '#0B0F19',     // Map to ink
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
