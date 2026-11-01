import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import type { Page } from './head'
import { Bio } from './pages/Bio'
import { Pricing } from './pages/Pricing'

/** Used at build time by scripts/prerender.mjs to turn each page into static HTML. */
export function render(page: Page): string {
  return renderToString(<StrictMode>{page === 'bio' ? <Bio /> : <Pricing />}</StrictMode>)
}
