import { describe, expect, it } from 'vitest'
import { pricing } from '../config/pricing'
import { defaultSelection, estimate, formatRange, isApplicable, roundPrice } from './pricing'

/** Every possible selection: the cartesian product of all group options. */
function allSelections(): Record<string, string>[] {
  return pricing.groups.reduce<Record<string, string>[]>(
    (combos, group) => combos.flatMap((combo) => group.options.map((o) => ({ ...combo, [group.id]: o.id }))),
    [{}],
  )
}

describe('pricing anchors', () => {
  it('hits the lowest anchor exactly: $700 – $900', () => {
    const lowest = pricing.anchors.find((a) => a.name === 'lowest')!
    expect(estimate(lowest.selection, pricing)).toEqual({ low: 700, high: 900 })
    expect(formatRange(estimate(lowest.selection, pricing), pricing)).toBe('$700 – $900')
  })

  it('hits the highest anchor exactly: $3,450 – $4,300', () => {
    const highest = pricing.anchors.find((a) => a.name === 'highest')!
    expect(estimate(highest.selection, pricing)).toEqual({ low: 3450, high: 4300 })
    expect(formatRange(estimate(highest.selection, pricing), pricing)).toBe('$3,450 – $4,300')
  })

  it('matches every anchor listed in the config', () => {
    for (const anchor of pricing.anchors) {
      expect(estimate(anchor.selection, pricing), anchor.name).toEqual({ low: anchor.low, high: anchor.high })
    }
  })

  it('anchors are the true minimum and maximum of all combinations', () => {
    const results = allSelections().map((s) => estimate(s, pricing))
    expect(Math.min(...results.map((r) => r.low))).toBe(700)
    expect(Math.max(...results.map((r) => r.high))).toBe(4300)
  })
})

describe('every combination', () => {
  const combos = allSelections()

  it('covers all 360 combinations', () => {
    expect(combos).toHaveLength(3 * 5 * 3 * 2 * 4)
  })

  it.each(combos.map((c) => [Object.values(c).join(' / '), c] as const))(
    '%s gives a valid range',
    (_name, selection) => {
      const { low, high } = estimate(selection, pricing)
      expect(low).toBeGreaterThan(0)
      expect(low).toBeLessThan(high)
      expect(low % pricing.round.to).toBe(0)
      expect(high % pricing.round.to).toBe(0)
    },
  )
})

describe('design-only rule', () => {
  const build = pricing.groups.find((g) => g.id === 'build')!

  it('marks Build method as not applicable for Design only', () => {
    expect(isApplicable(build, { service: 'design' })).toBe(false)
    expect(isApplicable(build, { service: 'dev' })).toBe(true)
    expect(isApplicable(build, { service: 'design-dev' })).toBe(true)
  })

  it('ignores Build method in pricing for Design only', () => {
    const base = { service: 'design', pages: '3', languages: '2', animation: 'medium' }
    expect(estimate({ ...base, build: 'coded' }, pricing)).toEqual(estimate({ ...base, build: 'nocode' }, pricing))
  })

  it('still charges for Build method on other services', () => {
    const base = { service: 'dev', pages: '3', languages: '2', animation: 'medium' }
    const coded = estimate({ ...base, build: 'coded' }, pricing)
    const nocode = estimate({ ...base, build: 'nocode' }, pricing)
    expect(coded.low - nocode.low).toBe(300)
  })
})

describe('defaults and helpers', () => {
  it('defaults to $1,750 – $2,200', () => {
    expect(formatRange(estimate(defaultSelection(pricing), pricing), pricing)).toBe('$1,750 – $2,200')
  })

  it('every default option exists in its group', () => {
    for (const g of pricing.groups) expect(g.options.map((o) => o.id)).toContain(g.defaultOption)
  })

  it('rounds to the nearest 50 with halves up', () => {
    const rule = { to: 50, mode: 'nearest' } as const
    expect(roundPrice(875, rule)).toBe(900)
    expect(roundPrice(4312.5, rule)).toBe(4300)
    expect(roundPrice(824, rule)).toBe(800)
    expect(roundPrice(825, rule)).toBe(850)
  })

  it('throws on an unknown option instead of silently pricing it at $0', () => {
    expect(() => estimate({ ...defaultSelection(pricing), pages: '99' }, pricing)).toThrow(/Unknown option/)
  })
})
