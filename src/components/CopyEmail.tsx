import { IconCheck, IconCopy } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { copyText, selectText } from '../lib/clipboard'

type State = 'idle' | 'copied' | 'manual'

const announcements: Record<State, string> = {
  idle: '',
  copied: 'Email address copied',
  manual: 'Copying is blocked in this browser. Press and hold the address to copy it.',
}

export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<State>('idle')
  const manualRef = useRef<HTMLSpanElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    if (state === 'manual' && manualRef.current) selectText(manualRef.current)
  }, [state])

  async function handleCopy() {
    window.clearTimeout(timer.current)
    if (await copyText(email)) {
      setState('copied')
      timer.current = window.setTimeout(() => setState('idle'), 2000)
    } else {
      setState('manual')
    }
  }

  return (
    <li className="row row--email">
      <a className="row__main" href={`mailto:${email}`}>
        <span className="row__title">Email</span>
        <span className="row__sub">{email}</span>
      </a>
      <button type="button" className="copy" data-state={state} onClick={handleCopy} aria-label="Copy email address">
        <span className="copy__label" aria-hidden="true">
          Copied
        </span>
        <span className="copy__icon" aria-hidden="true">
          <IconCopy size={20} stroke={1.75} className="copy__glyph copy__glyph--copy" />
          <IconCheck size={20} stroke={2} className="copy__glyph copy__glyph--check" />
        </span>
      </button>
      {state === 'manual' && (
        <p className="row__manual">
          Press and hold to copy: <span ref={manualRef}>{email}</span>
        </p>
      )}
      <span className="sr-only" role="status">
        {announcements[state]}
      </span>
    </li>
  )
}
