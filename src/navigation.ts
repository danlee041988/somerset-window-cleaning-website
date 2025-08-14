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
      title: 'Quick Links',
      links: [
        { text: 'Services', href: getPermalink('/services') },
        { text: 'About', href: getPermalink('/about') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
    {
      title: 'Legal',
      links: [
        { text: 'Terms', href: getPermalink('/terms') },
        { text: 'Privacy Policy', href: getPermalink('/privacy') },
      ],
    },
    {
      title: 'Contact',
      links: [
        { text: '01458 860339', href: 'tel:01458860339' },
        { text: 'info@somersetwindowcleaning.co.uk', href: 'mailto:info@somersetwindowcleaning.co.uk' },
        { text: '13 Rockhaven Business Centre, Gravenchon Way, BA16 0HW', href: '#' },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
  ],
  footNote: `
    © ${new Date().getFullYear()} Somerset Window Cleaning · VAT: 359 427 172
  `,
};
