import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/'),
      ariaLabel: 'Go to homepage',
    },
    {
      text: 'Services',
      href: getPermalink('/services'),
      ariaLabel: 'View our services',
      links: [
        { text: 'Window Cleaning', href: getPermalink('/services/window-cleaning'), ariaLabel: 'Learn about window cleaning services' },
        { text: 'Gutter Clearing', href: getPermalink('/services/gutter-cleaning'), ariaLabel: 'Learn about gutter cleaning services' },
        { text: 'Fascia & Soffit Cleaning', href: getPermalink('/services/fascia-soffit-cleaning'), ariaLabel: 'Learn about fascia and soffit cleaning' },
        { text: 'Conservatory Roof Cleaning', href: getPermalink('/services/conservatory-cleaning'), ariaLabel: 'Learn about conservatory cleaning services' },
        { text: 'Solar Panel Cleaning', href: getPermalink('/services/solar-panel-cleaning'), ariaLabel: 'Learn about solar panel cleaning' },
        { text: 'Commercial Window Cleaning', href: getPermalink('/services/commercial-window-cleaning'), ariaLabel: 'Learn about commercial window cleaning' }
      ],
    },
    {
      text: 'Meet the Team',
      href: getPermalink('/about'),
      ariaLabel: 'Meet the Somerset Window Cleaning team',
    },
  ],
  actions: [
    { text: 'Request Free Quote', href: getPermalink('/book-now'), variant: 'red', icon: 'tabler:file-text', priority: 1, class: 'sparkle-button animate-pulse hover:animate-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105', ariaLabel: 'Request free quote for window cleaning service' },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Our Services',
      links: [
        { text: 'Window Cleaning', href: getPermalink('/services/window-cleaning'), ariaLabel: 'Learn about window cleaning services' },
        { text: 'Gutter Clearing', href: getPermalink('/services/gutter-cleaning'), ariaLabel: 'Learn about gutter cleaning services' },
        { text: 'Fascia & Soffit Cleaning', href: getPermalink('/services/fascia-soffit-cleaning'), ariaLabel: 'Learn about fascia and soffit cleaning' },
        { text: 'Conservatory Roof Cleaning', href: getPermalink('/services/conservatory-cleaning'), ariaLabel: 'Learn about conservatory cleaning services' },
        { text: 'Solar Panel Cleaning', href: getPermalink('/services/solar-panel-cleaning'), ariaLabel: 'Learn about solar panel cleaning' },
        { text: 'Commercial Window Cleaning', href: getPermalink('/services/commercial-window-cleaning'), ariaLabel: 'Learn about commercial window cleaning' },
        { text: 'View All Services →', href: getPermalink('/services'), ariaLabel: 'View all cleaning services' },
      ],
    },

    {
      title: 'Get Started',
      links: [
        { text: 'Request Free Quote', href: getPermalink('/book-now'), ariaLabel: 'Request free quote online' },
        { text: 'Call 01458 860339', href: 'tel:01458860339', ariaLabel: 'Call Somerset Window Cleaning on 01458 860339' },
        { text: 'WhatsApp Quote', href: 'https://wa.me/447415526331?text=Hi%20Somerset%20Window%20Cleaning%2C%20please%20can%20I%20get%20a%20quote%20for%20window%20cleaning', ariaLabel: 'Get a quote via WhatsApp' },
        { text: 'Meet the Team', href: getPermalink('/about'), ariaLabel: 'Meet the Somerset Window Cleaning team' },
      ],
    },
    {
      title: 'Contact Details',
      links: [
        { text: 'Email: info@somersetwindowcleaning.co.uk', href: 'mailto:info@somersetwindowcleaning.co.uk', ariaLabel: 'Email Somerset Window Cleaning' },
        { text: '13 Rockhaven Business Centre', href: 'https://maps.google.com/?q=13+Rockhaven+Business+Centre+Gravenchon+Way+Street+Somerset+BA16+0HW', ariaLabel: 'View office location on Google Maps' },
        { text: 'Gravenchon Way, Street, Somerset BA16 0HW', href: 'https://maps.google.com/?q=13+Rockhaven+Business+Centre+Gravenchon+Way+Street+Somerset+BA16+0HW', ariaLabel: 'View full address on Google Maps' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms & Conditions', href: getPermalink('/terms'), ariaLabel: 'Read terms and conditions' },
    { text: 'Privacy Policy', href: getPermalink('/privacy'), ariaLabel: 'Read privacy policy' },
  ],
  socialLinks: [
    { ariaLabel: 'Visit Somerset Window Cleaning on Facebook', icon: 'tabler:brand-facebook', href: 'https://www.facebook.com/somersetwindowcleaning' },
    { ariaLabel: 'Follow Somerset Window Cleaning on Instagram', icon: 'tabler:brand-instagram', href: 'https://instagram.com/somersetwindowcleaning' },
    { ariaLabel: 'Connect with Somerset Window Cleaning on LinkedIn', icon: 'tabler:brand-linkedin', href: 'https://uk.linkedin.com/company/somerset-window-cleaning' },
  ],
  footNote: `
    © ${new Date().getFullYear()} Somerset Window Cleaning · VAT: 359 427 172 · Professional Window Cleaning Since 2019
  `,
};
