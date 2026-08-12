import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Spotlight from './Spotlight'

describe('Spotlight', () => {
  it('keeps option ids unique when recent services also appear in categories', () => {
    const { container } = render(
      <Spotlight
        open
        recent={['era-cloud']}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />,
    )

    const optionIds = [...container.querySelectorAll('[role="option"]')].map(
      (option) => option.id,
    )
    expect(new Set(optionIds).size).toBe(optionIds.length)
    const activeId = screen.getByRole('combobox', { name: '搜索服务' }).getAttribute(
      'aria-activedescendant',
    )
    expect(container.querySelectorAll(`#${activeId}`)).toHaveLength(1)
  })

  it('traps tab focus and lets the documented shortcut close cleanly', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Spotlight open onClose={onClose} onSelect={vi.fn()} />,
    )
    const focusable = [...container.querySelectorAll('input:not([disabled]), button:not([disabled])')]
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(first).toHaveFocus()

    fireEvent.keyDown(first, { key: 'k', metaKey: true })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
