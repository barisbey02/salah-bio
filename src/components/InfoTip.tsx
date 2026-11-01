import { IconInfoCircle } from '@tabler/icons-react'
import { useEffect, useId, useRef, useState } from 'react'

/**
 * A toggletip: tap or click the ⓘ to show a short note inline, tap again or press Escape to hide.
 * Unlike a hover tooltip it works on touch screens, and the note is announced when it opens.
 * Uses only <span>s so it can sit inside a <legend>.
 */
export function InfoTip({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        ref={button}
        type="button"
        className="infotip__button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
      >
        <IconInfoCircle size={18} stroke={1.75} aria-hidden="true" />
      </button>
      <span id={id} className="infotip__panel" role="status" hidden={!open}>
        {open ? text : null}
      </span>
    </>
  )
}
