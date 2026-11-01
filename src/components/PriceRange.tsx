import NumberFlow, { NumberFlowGroup } from '@number-flow/react'
import type { PricingConfig } from '../config/pricing'
import type { Estimate } from '../lib/pricing'

/**
 * Animated "$LOW – $HIGH". NumberFlow pre-renders its digits as plain text in
 * declarative shadow DOM, so the price is visible before JavaScript loads, and it
 * skips the digit roll when the visitor prefers reduced motion.
 */
export function PriceRange({ estimate, config }: { estimate: Estimate; config: PricingConfig }) {
  const format = { style: 'currency', currency: config.currency, maximumFractionDigits: 0 } as const
  return (
    <NumberFlowGroup>
      <NumberFlow value={estimate.low} locales={config.locale} format={format} />
      <span className="price__dash">–</span>
      <NumberFlow value={estimate.high} locales={config.locale} format={format} />
    </NumberFlowGroup>
  )
}
