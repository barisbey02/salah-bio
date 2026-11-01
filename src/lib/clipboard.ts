/**
 * Copy text with fallbacks for in-app browsers (Instagram, Facebook, TikTok),
 * where navigator.clipboard is often missing or blocked.
 *
 * Order matters: the legacy execCommand path runs first and synchronously, while
 * we are still inside the tap's user gesture. iOS WebKit drops the gesture after
 * an `await`, so trying the async API first and falling back after it rejects can
 * fail in exactly the browsers we care about. If execCommand reports failure, we
 * then try the async Clipboard API. Returns false when both fail, so the caller
 * can show a manual "press and hold" fallback.
 */
export async function copyText(text: string): Promise<boolean> {
  if (legacyCopy(text)) return true
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Permission denied or not allowed in this context.
  }
  return false
}

function legacyCopy(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '') // no keyboard flash on mobile
  textarea.setAttribute('aria-hidden', 'true')
  // 16px avoids the iOS zoom-on-focus; fixed + transparent keeps the page still.
  textarea.style.cssText = 'position:fixed;inset-block-start:0;inset-inline-start:0;opacity:0;font-size:16px;'
  document.body.appendChild(textarea)

  const selection = document.getSelection()
  const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null

  let ok = false
  try {
    textarea.focus({ preventScroll: true })
    textarea.select()
    textarea.setSelectionRange(0, text.length) // iOS needs an explicit range
    ok = document.execCommand('copy')
  } catch {
    ok = false
  } finally {
    textarea.remove()
    if (previous && selection) {
      selection.removeAllRanges()
      selection.addRange(previous)
    }
  }
  return ok
}

/** Select an element's text so the user can copy it by hand. */
export function selectText(element: HTMLElement): void {
  const selection = document.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
}
