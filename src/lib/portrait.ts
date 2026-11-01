import { content, portraitWidths } from '../config/content.ts'

/** Shared by the <img> and the <link rel="preload"> in the page head, so they always match. */
export const portrait = {
  src: `/img/portrait-${portraitWidths[1]}.webp`,
  srcSet: portraitWidths.map((w) => `/img/portrait-${w}.webp ${w}w`).join(', '),
  /** Full card width minus gutters and inset on mobile; a fixed column on wider screens. */
  sizes: '(min-width: 40rem) 14rem, calc(100vw - 48px)',
  alt: content.portrait.alt,
  objectPosition: `${content.portrait.focus.x}% ${content.portrait.focus.y}%`,
}
