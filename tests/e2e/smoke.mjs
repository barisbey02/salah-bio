/**
 * Browser smoke test against the production build, emulating the Instagram in-app browser on an iPhone.
 *
 *   npm run build && npm run test:e2e
 *
 * First time on a new machine: npx playwright install chromium
 */
import assert from 'node:assert/strict'
import { chromium, devices } from 'playwright'
import { preview } from 'vite'

const INSTAGRAM_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
  'Mobile/22A3354 Instagram 350.0.0.17.86 (iPhone14,5; iOS 18_0; en_US; en; scale=3.00; 1170x2532)'
const EMAIL = 'contact@baikgroup.com'

const server = await preview({ preview: { port: 4174, strictPort: true }, logLevel: 'silent' })
const base = 'http://localhost:4174'
const browser = await chromium.launch()
let failures = 0

async function test(name, fn) {
  const context = await browser.newContext({ ...devices['iPhone 13'], userAgent: INSTAGRAM_UA })
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  try {
    await fn(page)
    assert.deepEqual(errors, [], 'console errors')
    console.log(`  ✓ ${name}`)
  } catch (err) {
    failures++
    console.log(`  ✗ ${name}\n    ${err.message.split('\n').join('\n    ')}`)
  } finally {
    await context.close()
  }
}

/** Replace the clipboard paths before the page's scripts run. */
const stubClipboard = (page, { legacy, asyncApi }) =>
  page.addInitScript(
    ({ legacy, asyncApi }) => {
      window.__copied = null
      document.execCommand = (cmd) => {
        if (cmd !== 'copy' || !legacy) return false
        window.__copied = document.activeElement?.value ?? null
        return true
      }
      const writeText =
        asyncApi === 'missing'
          ? undefined
          : (text) => (asyncApi === 'ok' ? ((window.__copied = text), Promise.resolve()) : Promise.reject(new Error('NotAllowedError')))
      Object.defineProperty(navigator, 'clipboard', { value: writeText ? { writeText } : undefined, configurable: true })
    },
    { legacy, asyncApi },
  )

console.log('Bio page')

await test('renders and hydrates with no console errors', async (page) => {
  await page.goto(base + '/')
  await page.waitForLoadState('networkidle')
  assert.equal(await page.locator('h1').textContent(), 'Salah Al Baik')
  assert.equal(await page.locator('.profile__tagline strong').textContent(), 'worldwide')
})

await test('external links open in a new tab with rel="noopener noreferrer"', async (page) => {
  await page.goto(base + '/')
  const links = await page.$$eval('a[href^="http"]', (as) => as.map((a) => [a.href, a.target, a.rel]))
  assert.ok(links.length >= 6, `expected at least 6 external links, got ${links.length}`)
  for (const [href, target, rel] of links) {
    assert.equal(target, '_blank', href)
    assert.equal(rel, 'noopener noreferrer', href)
  }
})

await test('copy works through execCommand when the Clipboard API is missing (Instagram)', async (page) => {
  await stubClipboard(page, { legacy: true, asyncApi: 'missing' })
  await page.goto(base + '/')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Copy email address' }).click()
  await page.locator('.copy[data-state="copied"]').waitFor()
  assert.equal(await page.evaluate(() => window.__copied), EMAIL)
  assert.equal(await page.locator('.row--email [role="status"]').textContent(), 'Email address copied')
})

await test('copy falls back to the Clipboard API when execCommand fails', async (page) => {
  await stubClipboard(page, { legacy: false, asyncApi: 'ok' })
  await page.goto(base + '/')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Copy email address' }).click()
  await page.locator('.copy[data-state="copied"]').waitFor()
  assert.equal(await page.evaluate(() => window.__copied), EMAIL)
})

await test('when every copy path fails, the address is selected with a press-and-hold hint', async (page) => {
  await stubClipboard(page, { legacy: false, asyncApi: 'reject' })
  await page.goto(base + '/')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Copy email address' }).click()
  await page.locator('.row__manual').waitFor()
  assert.equal(await page.evaluate(() => String(document.getSelection())), EMAIL)
})

await test('"Web Development Pricing" goes to the calculator', async (page) => {
  await page.goto(base + '/')
  await page.getByRole('link', { name: 'Web Development Pricing' }).click()
  await page.waitForURL(base + '/pricing/')
  assert.equal(await page.locator('h1').textContent(), 'Estimate your project cost')
})

console.log('Pricing page')

const spoken = (page) => page.locator('.result [role="status"]').textContent()
const pick = (page, group, label) =>
  page.getByRole('group', { name: new RegExp(`^${group}`, 'i') }).getByRole('radio', { name: label, exact: true }).check()

await test('shows the default estimate', async (page) => {
  await page.goto(base + '/pricing/')
  await page.waitForLoadState('networkidle')
  assert.equal(await spoken(page), 'Estimated price: $1,750 to $2,200')
})

await test('hits the lowest anchor: $700 – $900', async (page) => {
  await page.goto(base + '/pricing/')
  await page.waitForLoadState('networkidle')
  await pick(page, 'Service', 'Design only')
  await pick(page, 'Number of pages', 'Landing page')
  await pick(page, 'Number of languages', '1')
  await pick(page, 'Animation level', 'No animation')
  assert.equal(await spoken(page), 'Estimated price: $700 to $900')
})

await test('hits the highest anchor: $3,450 – $4,300', async (page) => {
  await page.goto(base + '/pricing/')
  await page.waitForLoadState('networkidle')
  await pick(page, 'Service', 'Design & Development')
  await pick(page, 'Number of pages', '5+ pages')
  await pick(page, 'Number of languages', '3')
  await pick(page, 'Build method', 'Coded')
  await pick(page, 'Animation level', 'Heavy')
  assert.equal(await spoken(page), 'Estimated price: $3,450 to $4,300')
})

await test('chips are keyboard operable as a radio group (arrow keys)', async (page) => {
  await page.goto(base + '/pricing/')
  await page.waitForLoadState('networkidle')
  const service = page.getByRole('group', { name: /^Service/ })
  await service.getByRole('radio', { name: 'Design & Development' }).focus()
  await page.keyboard.press('ArrowRight')
  assert.ok(await service.getByRole('radio', { name: 'Design only' }).isChecked())
  await page.keyboard.press('ArrowRight')
  assert.ok(await service.getByRole('radio', { name: 'Development only' }).isChecked())
})

await test('Design only disables Build method with a note and ignores it in pricing', async (page) => {
  await page.goto(base + '/pricing/')
  await page.waitForLoadState('networkidle')
  await pick(page, 'Service', 'Design only')
  const build = page.getByRole('group', { name: /^Build method/ })
  assert.ok(await build.getByRole('radio', { name: 'Coded' }).isDisabled())
  assert.ok(await build.getByText('Not applicable to design-only').isVisible())
  const before = await spoken(page)
  await build.locator('.chip').first().click({ force: true }) // a click on a disabled chip changes nothing
  assert.equal(await spoken(page), before)
  assert.equal(before, 'Estimated price: $850 to $1,050')
  // Switching back restores the previous Build method choice.
  await pick(page, 'Service', 'Development only')
  assert.ok(await build.getByRole('radio', { name: 'Coded' }).isChecked())
})

await test('build-method info toggles and closes with Escape', async (page) => {
  await page.goto(base + '/pricing/')
  await page.waitForLoadState('networkidle')
  const button = page.getByRole('button', { name: 'About build method' })
  await button.click()
  assert.equal(await button.getAttribute('aria-expanded'), 'true')
  assert.match(await page.locator('.infotip__panel').textContent(), /visual builder/)
  await page.keyboard.press('Escape')
  assert.equal(await button.getAttribute('aria-expanded'), 'false')
})

await test('mailto is pre-filled with the selection and estimate', async (page) => {
  await page.goto(base + '/pricing/')
  await page.waitForLoadState('networkidle')
  await pick(page, 'Number of pages', '3 pages')
  const href = await page.getByRole('link', { name: EMAIL }).getAttribute('href')
  assert.ok(href.startsWith(`mailto:${EMAIL}?subject=`))
  const body = decodeURIComponent(href.split('&body=')[1])
  assert.match(body, /- Number of pages: 3 pages/)
  assert.match(body, /- Estimate: \$2,150 – \$2,700/)
})

await browser.close()
await server.close()

if (failures) {
  console.log(`\n${failures} failed`)
  process.exit(1)
}
console.log('\nAll smoke tests passed')
