/**
 * Generates optimized images from public/portrait.jpg:
 *   public/img/portrait-{480,800,1200}.webp  responsive sizes (cropped on the page with object-fit)
 *   public/img/og.jpg                         1200×630 share image, cropped around the focal point
 *   public/img/apple-touch-icon.png           180×180 home-screen icon
 *
 * Runs automatically before `npm run dev` and `npm run build`. Skips work when outputs are up to date.
 */
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { content, ogImage, portraitWidths } from '../src/config/content.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'public', content.portrait.src)
const outDir = join(root, 'public', 'img')
const focus = { x: content.portrait.focus.x / 100, y: content.portrait.focus.y / 100 }

if (!existsSync(source)) {
  console.error(`Portrait not found at ${source}. Add your photo there (JPEG).`)
  process.exit(1)
}
mkdirSync(outDir, { recursive: true })

const outputs = [
  ...portraitWidths.map((w) => join(outDir, `portrait-${w}.webp`)),
  join(outDir, 'og.jpg'),
  join(outDir, 'apple-touch-icon.png'),
]
const sourceTime = Math.max(statSync(source).mtimeMs, statSync(join(root, 'src/config/content.ts')).mtimeMs)
if (outputs.every((f) => existsSync(f) && statSync(f).mtimeMs >= sourceTime)) {
  console.log('images: up to date')
  process.exit(0)
}

// Apply the EXIF orientation once so phone photos are never sideways.
const oriented = await sharp(source).rotate().toBuffer({ resolveWithObject: true })
const { width: srcW, height: srcH } = oriented.info

/** Crop a box of the given aspect ratio around the focal point, then resize it. */
function focalCrop(targetW, targetH) {
  const scale = Math.max(targetW / srcW, targetH / srcH)
  const cropW = Math.round(targetW / scale)
  const cropH = Math.round(targetH / scale)
  const clamp = (v, max) => Math.min(Math.max(v, 0), max)
  const left = clamp(Math.round(focus.x * srcW - cropW / 2), srcW - cropW)
  const top = clamp(Math.round(focus.y * srcH - cropH / 2), srcH - cropH)
  return sharp(oriented.data).extract({ left, top, width: cropW, height: cropH }).resize(targetW, targetH)
}

await Promise.all([
  ...portraitWidths.map((w) =>
    sharp(oriented.data)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(join(outDir, `portrait-${w}.webp`)),
  ),
  focalCrop(ogImage.width, ogImage.height).jpeg({ quality: 82, mozjpeg: true }).toFile(join(outDir, 'og.jpg')),
  focalCrop(180, 180).png({ compressionLevel: 9 }).toFile(join(outDir, 'apple-touch-icon.png')),
])

console.log(`images: generated ${outputs.length} files from ${content.portrait.src} (${srcW}×${srcH})`)
