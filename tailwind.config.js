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
        primary: '#1F2937',              // Dark gray for primary elements
        secondary: '#000000',            // Pure black for text
        accent: '#3B82F6',               // Blue accent for highlights
        default: '#000000',              // Black text as default
        muted: '#1F2937',                // Darker gray for better readability
        // Light color palette for backgrounds and surfaces
        'gray': {
          50: '#F9FAFB',    // Lightest - primary background
          100: '#F3F4F6',   // Very light - card backgrounds
          200: '#E5E7EB',   // Light - borders and dividers
          300: '#D1D5DB',   // Medium light - disabled states
          400: '#9CA3AF',   // Medium - subtle text
          500: '#6B7280',   // Medium dark - secondary text
          600: '#4B5563',   // Dark - tertiary text
          700: '#374151',   // Darker - headings
          800: '#1F2937',   // Very dark - primary text
          900: '#111827',   // Darkest - strong emphasis
          950: '#030712'    // Black
        },
        'blue': {
          50: '#EFF6FF',    // Very light blue - subtle highlights
          100: '#DBEAFE',   // Light blue - backgrounds
          200: '#BFDBFE',   // Medium light blue
          300: '#93C5FD',   // Medium blue
          400: '#60A5FA',   // Brighter blue
          500: '#3B82F6',   // Primary blue - links/CTAs
          600: '#2563EB',   // Darker blue - hover states
          700: '#1D4ED8',   // Dark blue
          800: '#1E40AF',   // Darker blue
          900: '#1E3A8A',   // Very dark blue
          950: '#172554'    // Darkest blue
        },
        // Named colors for light theme consistency
        'text-primary': '#000000',       // Pure black for main text
        'text-secondary': '#374151',     // Dark gray for secondary text
        'text-muted': '#1F2937',         // Darker gray for better readability
        'surface': '#FFFFFF',            // Pure white surface
        'surface-light': '#F9FAFB',      // Very light gray surface
        'surface-subtle': '#F3F4F6',     // Light gray for subtle areas
        'border': '#E5E7EB',             // Light gray for borders
        'border-strong': '#D1D5DB',      // Medium gray for stronger borders
        'accent-blue': '#3B82F6',        // Blue for accents and links
        'accent-blue-hover': '#2563EB',  // Darker blue for hover states
        // Button colors for light theme
        'btn-primary': '#1F2937',        // Dark gray for primary buttons
        'btn-primary-text': '#FFFFFF',   // White text on dark buttons
        'btn-secondary': '#F9FAFB',      // Light background for secondary buttons
        'btn-secondary-text': '#374151', // Dark text on light buttons
        'btn-accent': '#3B82F6',         // Blue accent buttons
        'btn-accent-text': '#FFFFFF',    // White text on blue buttons
        // Status colors
        'success': '#059669',            // Green for success states
        'warning': '#D97706',            // Orange for warnings
        'error': '#DC2626',              // Red for errors
        'info': '#2563EB',               // Blue for info
        // Blue primary used in homepage
        'blue-primary': '#3B82F6',       // Blue for primary accents
        // Legacy compatibility (updated for light theme)
        'brand-black': '#000000',        // Black for text
        'brand-primary': '#1F2937',      // Dark gray primary
        'brand-accent': '#3B82F6',       // Blue accent
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
  darkMode: false, // Disable dark mode completely - force light mode only
};
