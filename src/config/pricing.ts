/**
 * Pricing config: the ONLY place prices live.
 *
 * How the estimate works (see src/lib/pricing.ts):
 *   low  = sum of the selected option prices (service base + every add-on)
 *   high = low × spread
 *   both are then rounded to the nearest `round.to` dollars (halves round up).
 *
 * Edit any number below and run `npm test`: the tests recompute every
 * combination and will tell you if the two anchors no longer match.
 * If you change prices on purpose, update `anchors` at the bottom too.
 */

export const pricing = {
  currency: 'USD',
  locale: 'en-US',

  /** High end = low end × spread. 1.25 means the high end is 25% above the low end. */
  spread: 1.25,

  /** Rounding rule applied to both ends of the range. */
  round: {
    to: 50,
    /** 'nearest' (halves round up), 'up', or 'down'. */
    mode: 'nearest',
  },

  groups: [
    {
      id: 'service',
      label: 'Service',
      defaultOption: 'design-dev',
      options: [
        { id: 'design-dev', label: 'Design & Development', price: 1300 },
        { id: 'design', label: 'Design only', price: 700 },
        { id: 'dev', label: 'Development only', price: 900 },
      ],
    },
    {
      id: 'pages',
      label: 'Number of pages',
      defaultOption: 'landing',
      options: [
        { id: 'landing', label: 'Landing page', price: 0 },
        { id: '2', label: '2 pages', price: 200 },
        { id: '3', label: '3 pages', price: 400 },
        { id: '5', label: '5 pages', price: 700 },
        { id: '5plus', label: '5+ pages', price: 1000 },
      ],
    },
    {
      id: 'languages',
      label: 'Number of languages',
      defaultOption: '1',
      options: [
        { id: '1', label: '1', price: 0 },
        { id: '2', label: '2', price: 250 },
        { id: '3', label: '3', price: 450 },
      ],
    },
    {
      id: 'build',
      label: 'Build method',
      defaultOption: 'coded',
      info:
        'Coded sites are built from scratch in code and can be fully customized. ' +
        'No-code sites are built in a visual builder like Framer, so you can edit text and images yourself.',
      /** This group is disabled, and ignored in pricing, while any of these selections is active. */
      notApplicableWhen: { group: 'service', options: ['design'] },
      notApplicableNote: 'Not applicable to design-only',
      options: [
        { id: 'coded', label: 'Coded', price: 300 },
        { id: 'nocode', label: 'No-code', price: 0 },
      ],
    },
    {
      id: 'animation',
      label: 'Animation level',
      defaultOption: 'light',
      options: [
        { id: 'none', label: 'No animation', price: 0 },
        { id: 'light', label: 'Light', price: 150 },
        { id: 'medium', label: 'Medium', price: 300 },
        { id: 'heavy', label: 'Heavy', price: 400 },
      ],
    },
  ],

  /** Reference points checked by the unit tests. */
  anchors: [
    {
      name: 'lowest',
      selection: { service: 'design', pages: 'landing', languages: '1', build: 'nocode', animation: 'none' },
      low: 700,
      high: 900,
    },
    {
      name: 'highest',
      selection: { service: 'design-dev', pages: '5plus', languages: '3', build: 'coded', animation: 'heavy' },
      low: 3450,
      high: 4300,
    },
  ],
} as const satisfies PricingConfig

/* ---------- Types (no need to edit below this line) ---------- */

export interface PricingOption {
  readonly id: string
  readonly label: string
  readonly price: number
}

export interface PricingGroup {
  readonly id: string
  readonly label: string
  readonly defaultOption: string
  readonly options: readonly PricingOption[]
  readonly info?: string
  readonly notApplicableWhen?: { readonly group: string; readonly options: readonly string[] }
  readonly notApplicableNote?: string
}

export interface PricingConfig {
  readonly currency: string
  readonly locale: string
  readonly spread: number
  readonly round: { readonly to: number; readonly mode: 'nearest' | 'up' | 'down' }
  readonly groups: readonly PricingGroup[]
  readonly anchors: readonly {
    readonly name: string
    readonly selection: Readonly<Record<string, string>>
    readonly low: number
    readonly high: number
  }[]
}
