import { StrictMode, type ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

/** Hydrate the pre-rendered HTML in production; render from scratch in dev. */
export function mount(app: ReactNode) {
  const root = document.getElementById('root')!
  const tree = <StrictMode>{app}</StrictMode>
  if (root.firstElementChild) hydrateRoot(root, tree)
  else createRoot(root).render(tree)
}
