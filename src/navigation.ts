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
    },
    {
      text: 'Gallery',
      href: getPermalink('/gallery'),
    },
    {
      text: 'Pricing',
      href: getPermalink('/pricing'),
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
    { text: 'Call 01458 860339', href: 'tel:01458860339', variant: 'secondary', icon: 'tabler:phone', priority: 1 },
    { text: 'WhatsApp', href: 'https://wa.me/447415526331?text=Hi%20Somerset%20Window%20Cleaning%2C%20please%20can%20I%20get%20a%20quote%20for%20window%20cleaning%20at%20%5Byour%20address%5D', variant: 'whatsapp', icon: 'tabler:brand-whatsapp', priority: 2 },
    { text: 'Get a quote', href: getPermalink('/contact'), variant: 'primary', icon: 'tabler:calendar', priority: 3 },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Services',
      links: [
        { text: 'Window Cleaning', href: getPermalink('/services') },
        { text: 'Gutter Clearing', href: getPermalink('/services#gutters') },
        { text: 'Conservatory Cleaning', href: getPermalink('/services#conservatory') },
        { text: 'Solar Panel Cleaning', href: getPermalink('/services#solar') },
        { text: 'Commercial Cleaning', href: getPermalink('/services#commercial') },
      ],
    },
    {
      title: 'Service Areas',
      links: [
        { text: 'Bath Window Cleaning', href: getPermalink('/areas/bath') },
        { text: 'Wells Window Cleaning', href: getPermalink('/areas/wells') },
        { text: 'Street Window Cleaning', href: getPermalink('/areas/street') },
        { text: 'Glastonbury Window Cleaning', href: getPermalink('/areas/glastonbury') },
        { text: 'Yeovil Window Cleaning', href: getPermalink('/areas/yeovil') },
      ],
    },
    {
      title: 'Quick Links',
      links: [
        { text: 'Instant Quote', href: getPermalink('/instant-quote') },
        { text: 'Pricing', href: getPermalink('/pricing') },
        { text: 'Gallery', href: getPermalink('/gallery') },
        { text: 'About Us', href: getPermalink('/about') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
    {
      title: 'Contact Info',
      links: [
        { text: 'Call 01458 860339', href: 'tel:01458860339' },
        { text: 'WhatsApp Quote', href: 'https://wa.me/447415526331?text=Hi%20Somerset%20Window%20Cleaning%2C%20please%20can%20I%20get%20a%20quote%20for%20window%20cleaning' },
        { text: 'Email Us', href: 'mailto:info@somersetwindowcleaning.co.uk' },
        { text: 'Street, Somerset BA16 0HW', href: 'https://maps.google.com/?q=13+Rockhaven+Business+Centre+Gravenchon+Way+Street+Somerset+BA16+0HW' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms & Conditions', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
    { text: 'Service Areas', href: getPermalink('/areas') },
  ],
  socialLinks: [
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://facebook.com/somersetwindowcleaning' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://instagram.com/somersetwindowcleaning' },
  ],
  footNote: `
    © ${new Date().getFullYear()} Somerset Window Cleaning · VAT: 359 427 172 · Professional Window Cleaning Since 2019
  `,
};
