import { IconArrowRight, IconArrowUpRight } from '@tabler/icons-react'
import type { LinkIcon } from '../config/content'
import { NewTabNote, externalProps, isExternal, linkIcons } from './Icons'

export function LinkRow({ icon, title, href }: { icon: LinkIcon; title: string; href: string }) {
  const external = isExternal(href)
  const Glyph = linkIcons[icon]
  const Arrow = external ? IconArrowUpRight : IconArrowRight
  return (
    <li>
      <a className="row row--link" href={href} {...(external ? externalProps : {})}>
        <span className="row__badge" aria-hidden="true">
          <Glyph size={20} stroke={1.75} />
        </span>
        <span className="row__title">
          {title}
          {external && <NewTabNote />}
        </span>
        <Arrow className="row__arrow" size={18} stroke={2} aria-hidden="true" />
      </a>
    </li>
  )
}
