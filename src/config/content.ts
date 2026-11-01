/**
 * Site content: names, links and copy. Edit this file to change what the pages say.
 * Colors live in src/styles/tokens.css and prices in src/config/pricing.ts.
 */

export const content = {
  /** Public URL with no trailing slash. Used for canonical links and Open Graph tags. */
  siteUrl: 'https://bio.baikgroup.com',

  name: 'Salah Al Baik',
  role: 'Software Engineer',

  /** The tagline is split so the last word can be emphasized. */
  tagline: {
    text: 'I build fast websites that turn visitors into customers, and AI automations that save businesses time. Working with clients',
    emphasis: 'worldwide',
    end: '.',
  },

  portrait: {
    /** Source photo. Replace this file and run `npm run images` (dev and build do it automatically). */
    src: '/portrait.jpg',
    alt: 'Portrait of Salah Al Baik',
    /**
     * Focal point of the photo, as CSS object-position percentages.
     * The photo is cropped to a square on the page and to 1200×630 for the share image;
     * this keeps the face in frame. 50% 50% is the center; lower y moves the crop up.
     */
    focus: { x: 50, y: 30 },
  },

  /** Icons available: 'website' | 'instagram' | 'x' | 'linkedin' */
  socials: [
    { icon: 'website', label: 'Website', href: 'https://portfolio.baikgroup.com' },
    { icon: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/salahalbaik_' },
    { icon: 'x', label: 'X', href: 'https://x.com/s7loh_' },
    { icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/salah-albeik' },
  ],

  email: 'contact@baikgroup.com',

  /** Rows in the second card. Icons available: 'calendar' | 'calculator' | 'link'. */
  links: [
    { icon: 'calendar', title: 'Book a Call', href: 'https://cal.com/salah-albaik-1krmrp' },
    { icon: 'calculator', title: 'Web Development Pricing', href: '/pricing/' },
  ],

  footer: { label: 'portfolio.baikgroup.com', href: 'https://portfolio.baikgroup.com' },

  /** Browser/in-app toolbar color on mobile. Keep in sync with --bg in src/styles/tokens.css. */
  themeColor: '#efeae2',

  /** Social handle for the Twitter/X card tag. */
  xHandle: '@s7loh_',

  pricingPage: {
    title: 'Estimate your project cost',
    subtitle: 'Select your project details and get an instant price estimate.',
    resultCaption: 'Estimated price in USD',
    disclaimer: 'This is a rough estimate to give you an idea of pricing.',
    closing: {
      heading: 'Want an exact quote?',
      text: 'Email me your selection and a few lines about your project.',
    },
    backLabel: 'Salah Al Baik',
  },

  meta: {
    bio: {
      title: 'Salah Al Baik · Software Engineer',
      description:
        'Software engineer in Istanbul. I build fast websites that turn visitors into customers, and AI automations that save businesses time.',
    },
    pricing: {
      title: 'Website cost calculator · Salah Al Baik',
      description:
        'Select your project details and get an instant price estimate for a website designed and built by Salah Al Baik.',
    },
  },
} as const

export type SocialIcon = (typeof content.socials)[number]['icon']
export type LinkIcon = (typeof content.links)[number]['icon'] | 'link'

/** Generated portrait sizes (written by scripts/images.mjs into public/img). */
export const portraitWidths = [480, 800, 1200] as const
export const ogImage = { path: '/img/og.jpg', width: 1200, height: 630 } as const
