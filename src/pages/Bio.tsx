import { CopyEmail } from '../components/CopyEmail'
import { NewTabNote, externalProps, socialIcons } from '../components/Icons'
import { LinkRow } from '../components/LinkRow'
import { content } from '../config/content'
import { portrait } from '../lib/portrait'

export function Bio() {
  return (
    <main className="page">
      <div className="page__inner">
        <section className="card profile" aria-labelledby="name">
          <img
            className="profile__photo"
            src={portrait.src}
            srcSet={portrait.srcSet}
            sizes={portrait.sizes}
            width={800}
            height={800}
            alt={portrait.alt}
            fetchPriority="high"
            style={{ objectPosition: portrait.objectPosition }}
          />
          <div className="profile__body">
            <h1 id="name" className="profile__name">
              {content.name}
            </h1>
            <p className="profile__role">{content.role}</p>
            <ul className="socials">
              {content.socials.map(({ icon, label, href }) => {
                const Glyph = socialIcons[icon]
                return (
                  <li key={icon}>
                    <a className="socials__link" href={href} {...externalProps}>
                      <Glyph size={22} stroke={1.75} aria-hidden="true" />
                      <span className="sr-only">{label}</span>
                      <NewTabNote />
                    </a>
                  </li>
                )
              })}
            </ul>
            <p className="profile__tagline">
              {content.tagline.text} <strong>{content.tagline.emphasis}</strong>
              {content.tagline.end}
            </p>
          </div>
        </section>

        <section className="card" aria-label="Contact and links">
          <ul className="list">
            <CopyEmail email={content.email} />
            {content.links.map((link) => (
              <LinkRow key={link.href} {...link} />
            ))}
          </ul>
        </section>

        <footer className="footer">
          <a className="pill" href={content.footer.href} {...externalProps}>
            {content.footer.label}
            <NewTabNote />
          </a>
        </footer>
      </div>
    </main>
  )
}
