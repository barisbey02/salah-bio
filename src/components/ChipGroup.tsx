import { useId } from 'react'
import type { PricingGroup } from '../config/pricing'
import { InfoTip } from './InfoTip'

interface Props {
  group: PricingGroup
  value: string
  disabled: boolean
  onChange: (optionId: string) => void
}

/**
 * Single-select chips built on native radio inputs inside a fieldset, so the browser
 * provides radio-group semantics and keyboard support (Tab in, arrow keys to move).
 * When the group is not applicable the fieldset is disabled and a note explains why.
 */
export function ChipGroup({ group, value, disabled, onChange }: Props) {
  const name = useId()
  return (
    <fieldset className="group" disabled={disabled}>
      {/* Controls inside the legend stay usable even when the fieldset is disabled. */}
      <legend className="group__legend">
        <span className="group__label">{group.label}</span>
        {group.info && <InfoTip label={`About ${group.label.toLowerCase()}`} text={group.info} />}
        {disabled && group.notApplicableNote && <span className="group__note">{group.notApplicableNote}</span>}
      </legend>
      <div className="chips">
        {group.options.map((option) => (
          <label className="chip" key={option.id}>
            <input
              className="chip__input"
              type="radio"
              name={name}
              value={option.id}
              checked={!disabled && value === option.id}
              onChange={() => onChange(option.id)}
            />
            <span className="chip__face">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
