import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import { headTags, type Page } from './src/head.ts'

/** Injects each page's <head> tags (from src/config/content.ts) in dev and build. */
function pageHead(): Plugin {
  return {
    name: 'page-head',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const page: Page = ctx.path.startsWith('/pricing') ? 'pricing' : 'bio'
        // In the build, find the hashed Geist file so we can preload it.
        const font = ctx.bundle
          ? Object.keys(ctx.bundle).find((f) => /geist-latin-wght-normal.*\.woff2$/.test(f))
          : undefined
        return html.replace('<!--head-->', headTags(page, font ? `/${font}` : undefined))
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), pageHead()],
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        bio: resolve(import.meta.dirname, 'index.html'),
        pricing: resolve(import.meta.dirname, 'pricing/index.html'),
      },
      output: {
        // One shared, long-cached chunk for React so moving between pages reuses it.
        advancedChunks: {
          groups: [{ name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ }],
        },
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
