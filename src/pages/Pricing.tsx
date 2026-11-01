import { IconArrowLeft, IconMail } from '@tabler/icons-react'
import { useState } from 'react'
import { ChipGroup } from '../components/ChipGroup'
import { PriceRange } from '../components/PriceRange'
import { content } from '../config/content'
import { pricing } from '../config/pricing'
import { defaultSelection, estimate, formatRange, isApplicable, type Selection } from '../lib/pricing'

const copy = content.pricingPage

/** mailto: link pre-filled with the visitor's selection and estimate. */
function quoteMailto(selection: Selection, range: string): string {
  const lines = pricing.groups
    .filter((g) => isApplicable(g, selection))
    .map((g) => `- ${g.label}: ${g.options.find((o) => o.id === selection[g.id])?.label}`)
  const subject = `Project inquiry (estimate ${range})`
  const body = [
    'Hi Salah,',
    '',
    'I used your cost calculator:',
    ...lines,
    `- Estimate: ${range}`,
    '',
    'About my project:',
    '',
  ].join('\r\n')
  return `mailto:${content.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function Pricing() {
  const [selection, setSelection] = useState<Record<string, string>>(() => defaultSelection(pricing))
  const result = estimate(selection, pricing)
  const range = formatRange(result, pricing)
  const spokenRange = range.replace(' – ', ' to ')

  return (
    <main className="page">
      <div className="page__inner">
        <a className="back" href="/">
          <IconArrowLeft className="back__icon" size={18} stroke={2} aria-hidden="true" />
          {copy.backLabel}
        </a>

        <section className="card calc" aria-labelledby="calc-title">
          <header className="calc__header">
            <h1 id="calc-title" className="calc__title">
              {copy.title}
            </h1>
            <p className="calc__subtitle">{copy.subtitle}</p>
          </header>

          <form className="calc__groups" onSubmit={(e) => e.preventDefault()} aria-label="Project details">
            {pricing.groups.map((group) => (
              <ChipGroup
                key={group.id}
                group={group}
                value={selection[group.id]}
                disabled={!isApplicable(group, selection)}
                onChange={(optionId) => setSelection((s) => ({ ...s, [group.id]: optionId }))}
              />
            ))}
          </form>

          <div className="result">
            <p className="result__price" aria-hidden="true">
              <PriceRange estimate={result} config={pricing} />
            </p>
            <p className="sr-only" role="status">
              Estimated price: {spokenRange}
            </p>
            <p className="result__caption">{copy.resultCaption}</p>
            <p className="result__disclaimer">{copy.disclaimer}</p>
          </div>

          <div className="closing">
            <div>
              <h2 className="closing__heading">{copy.closing.heading}</h2>
              <p className="closing__text">{copy.closing.text}</p>
            </div>
            <a className="cta" href={quoteMailto(selection, range)}>
              <IconMail size={20} stroke={1.75} aria-hidden="true" />
              {content.email}
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
