import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
  IconCalculator,
  IconCalendarEvent,
  IconExternalLink,
  IconWorld,
  type Icon,
} from '@tabler/icons-react'
import type { LinkIcon, SocialIcon } from '../config/content'

export const socialIcons: Record<SocialIcon, Icon> = {
  website: IconWorld,
  instagram: IconBrandInstagram,
  x: IconBrandX,
  linkedin: IconBrandLinkedin,
}

export const linkIcons: Record<LinkIcon, Icon> = {
  calendar: IconCalendarEvent,
  calculator: IconCalculator,
  link: IconExternalLink,
}

export const isExternal = (href: string) => /^https?:\/\//.test(href)

/** Props for links that leave the site. */
export const externalProps = { target: '_blank', rel: 'noopener noreferrer' } as const

export const NewTabNote = () => <span className="sr-only"> (opens in a new tab)</span>
