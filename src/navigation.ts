import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/'),
    },
    {
      text: 'Services',
      href: getPermalink('/services'),
      links: [
        { text: 'Window Cleaning', href: getPermalink('/services/window-cleaning') },
        { text: 'Gutter Clearing', href: getPermalink('/services/gutter-cleaning') },
        { text: 'Fascia & Soffit Cleaning', href: getPermalink('/services/fascia-soffit-cleaning') },
        { text: 'Conservatory Roof Cleaning', href: getPermalink('/services/conservatory-cleaning') },
        { text: 'Solar Panel Cleaning', href: getPermalink('/services/solar-panel-cleaning') },
        { text: 'Commercial Window Cleaning', href: getPermalink('/services/commercial-window-cleaning') }
      ],
    },
    {
      text: 'Areas',
      href: getPermalink('/areas'),
      links: [
        { text: 'All Coverage Areas', href: getPermalink('/areas') },
        { text: 'Glastonbury (BA6)', href: getPermalink('/areas/glastonbury') },
        { text: 'Wells (BA5)', href: getPermalink('/areas/wells') },
        { text: 'Street (BA16)', href: getPermalink('/areas/street') },
        { text: 'Taunton (TA)', href: getPermalink('/areas/taunton') },
        { text: 'Yeovil (BA20-22)', href: getPermalink('/areas/yeovil') },
      ],
    },
    {
      text: 'About',
      href: getPermalink('/about'),
    },
    {
      text: 'Contact',
      href: getPermalink('/contact'),
    },
  ],
  actions: [
    { text: 'Book Now', href: getPermalink('/book-now'), variant: 'red', icon: 'tabler:calendar-plus', priority: 1, class: 'sparkle-button animate-pulse hover:animate-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105' },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Our Services',
      links: [
        { text: 'Window Cleaning', href: getPermalink('/services/window-cleaning') },
        { text: 'Gutter Clearing', href: getPermalink('/services/gutter-cleaning') },
        { text: 'Fascia & Soffit Cleaning', href: getPermalink('/services/fascia-soffit-cleaning') },
        { text: 'Conservatory Roof Cleaning', href: getPermalink('/services/conservatory-cleaning') },
        { text: 'Solar Panel Cleaning', href: getPermalink('/services/solar-panel-cleaning') },
        { text: 'Commercial Window Cleaning', href: getPermalink('/services/commercial-window-cleaning') },
        { text: 'View All Services →', href: getPermalink('/services') },
      ],
    },

    {
      title: 'Get Started',
      links: [
        { text: 'Book Now', href: getPermalink('/book-now') },
        { text: 'Call 01458 860339', href: 'tel:01458860339' },
        { text: 'WhatsApp Quote', href: 'https://wa.me/447415526331?text=Hi%20Somerset%20Window%20Cleaning%2C%20please%20can%20I%20get%20a%20quote%20for%20window%20cleaning' },
        { text: 'About Us', href: getPermalink('/about') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
    {
      title: 'Contact Details',
      links: [
        { text: 'Email: info@somersetwindowcleaning.co.uk', href: 'mailto:info@somersetwindowcleaning.co.uk' },
        { text: '13 Rockhaven Business Centre', href: 'https://maps.google.com/?q=13+Rockhaven+Business+Centre+Gravenchon+Way+Street+Somerset+BA16+0HW' },
        { text: 'Gravenchon Way, Street, Somerset BA16 0HW', href: 'https://maps.google.com/?q=13+Rockhaven+Business+Centre+Gravenchon+Way+Street+Somerset+BA16+0HW' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms & Conditions', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://www.facebook.com/somersetwindowcleaning' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://instagram.com/somersetwindowcleaning' },
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: 'https://uk.linkedin.com/company/somerset-window-cleaning' },
  ],
  footNote: `
    © ${new Date().getFullYear()} Somerset Window Cleaning · VAT: 359 427 172 · Professional Window Cleaning Since 2019
  `,
};
