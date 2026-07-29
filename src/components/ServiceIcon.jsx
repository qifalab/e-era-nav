import { createElement } from 'react'
import { ICON_DEFINITIONS } from '../icons/originalIconRegistry'

const sharedProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export default function ServiceIcon({ name, className }) {
  const definition = ICON_DEFINITIONS[name]
  if (!definition) return null

  return (
    <svg {...sharedProps} className={className}>
      {definition.elements.map(({ tag, attrs }, index) =>
        createElement(tag, { ...attrs, key: `${name}-${tag}-${index}` }),
      )}
    </svg>
  )
}
