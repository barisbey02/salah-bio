import { content, ogImage } from './config/content.ts'
import { portrait } from './lib/portrait.ts'

export type Page = 'bio' | 'pricing'

const paths: Record<Page, string> = { bio: '/', pricing: '/pricing/' }

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** All <head> tags for a page, built from the content config. Used by vite.config.ts. */
export function headTags(page: Page, fontHref?: string): string {
  const meta = content.meta[page]
  const url = content.siteUrl + paths[page]
  const image = content.siteUrl + ogImage.path
  const imageAlt = `${content.name}, ${content.role}`

  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="theme-color" content="${content.themeColor}" />`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`,
    `<link rel="apple-touch-icon" href="/img/apple-touch-icon.png" />`,

    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(content.name)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="${ogImage.width}" />`,
    `<meta property="og:image:height" content="${ogImage.height}" />`,
    `<meta property="og:image:alt" content="${esc(imageAlt)}" />`,

    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="${content.xHandle}" />`,
    `<meta name="twitter:creator" content="${content.xHandle}" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${esc(imageAlt)}" />`,
  ]

  if (fontHref) {
    tags.push(`<link rel="preload" href="${fontHref}" as="font" type="font/woff2" crossorigin />`)
  }

  if (page === 'bio') {
    tags.push(
      // Start the portrait download before CSS and JS: it is the largest element on the page.
      `<link rel="preload" as="image" type="image/webp" href="${portrait.src}" imagesrcset="${portrait.srcSet}" imagesizes="${portrait.sizes}" fetchpriority="high" />`,
      `<link rel="prefetch" href="${paths.pricing}" />`,
      `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: content.name,
        jobTitle: content.role,
        url: content.siteUrl,
        email: `mailto:${content.email}`,
        image: image,
        sameAs: content.socials.map((s) => s.href),
      }).replace(/</g, '\\u003c')}</script>`,
    )
  }

  return tags.join('\n    ')
}
