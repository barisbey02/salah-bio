import type { PricingConfig, PricingGroup } from '../config/pricing'

export type Selection = Readonly<Record<string, string>>

export interface Estimate {
  low: number
  high: number
}

export function roundPrice(value: number, rule: PricingConfig['round']): number {
  const steps = value / rule.to
  // Guard against float noise like 17.499999999 before rounding.
  const clean = Math.round(steps * 1e6) / 1e6
  const rounded =
    rule.mode === 'up' ? Math.ceil(clean) : rule.mode === 'down' ? Math.floor(clean) : Math.floor(clean + 0.5)
  return rounded * rule.to
}

/** A group is not applicable when its `notApplicableWhen` condition matches the current selection. */
export function isApplicable(group: PricingGroup, selection: Selection): boolean {
  const rule = group.notApplicableWhen
  if (!rule) return true
  return !rule.options.includes(selection[rule.group] ?? '')
}

export function defaultSelection(config: PricingConfig): Record<string, string> {
  return Object.fromEntries(config.groups.map((g) => [g.id, g.defaultOption]))
}

export function estimate(selection: Selection, config: PricingConfig): Estimate {
  let sum = 0
  for (const group of config.groups) {
    if (!isApplicable(group, selection)) continue
    const option = group.options.find((o) => o.id === selection[group.id])
    if (!option) throw new Error(`Unknown option "${selection[group.id]}" for group "${group.id}"`)
    sum += option.price
  }
  return {
    low: roundPrice(sum, config.round),
    high: roundPrice(sum * config.spread, config.round),
  }
}

export function formatPrice(value: number, config: PricingConfig): string {
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatRange({ low, high }: Estimate, config: PricingConfig): string {
  return `${formatPrice(low, config)} – ${formatPrice(high, config)}`
}
