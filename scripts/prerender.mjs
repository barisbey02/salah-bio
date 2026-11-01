/**
 * Pre-renders each page to static HTML after `vite build`, so content (and the portrait)
 * shows before JavaScript loads. React then hydrates it in the browser.
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { render } = await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href)

const pages = { bio: 'dist/index.html', pricing: 'dist/pricing/index.html' }

for (const [page, file] of Object.entries(pages)) {
  const path = join(root, file)
  const html = readFileSync(path, 'utf8')
  if (!html.includes('<!--app-->')) throw new Error(`No <!--app--> placeholder in ${file}`)
  const out = inlineStyles(html.replace('<!--app-->', render(page)))
  writeFileSync(path, out)
  console.log(`prerendered ${file}`)
}

rmSync(join(root, 'dist-ssr'), { recursive: true, force: true })
// The source photo is only an input for scripts/images.mjs; don't publish the full-size original.
rmSync(join(root, 'dist', 'portrait.jpg'), { force: true })

/**
 * Inline the page's stylesheets (about 2.5 KB gzipped in total) so the first paint
 * doesn't wait for extra CSS requests. Font URLs inside are absolute, so they still resolve.
 */
function inlineStyles(html) {
  return html.replace(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/g, (_tag, href) => {
    const css = readFileSync(join(root, 'dist', href), 'utf8')
    return `<style>${css}</style>`
  })
}
