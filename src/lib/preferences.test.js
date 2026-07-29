import { beforeEach, describe, expect, it } from 'vitest'
import {
  addRecentService,
  getStoredArray,
  getStoredValue,
  setStoredArray,
  setStoredValue,
} from './preferences'

describe('local preferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('recovers from malformed local storage', () => {
    localStorage.setItem('broken', '{not json')
    expect(getStoredArray('broken')).toEqual([])
  })

  it('keeps recent services unique and bounded', () => {
    setStoredArray(
      'recent',
      Array.from({ length: 8 }, (_, index) => `service-${index}`),
    )
    expect(addRecentService('recent', 'era-cloud', 6)).toEqual([
      'era-cloud',
      'service-0',
      'service-1',
      'service-2',
      'service-3',
      'service-4',
    ])
  })

  it('stores scalar preferences and filters invalid array members', () => {
    expect(setStoredValue('theme', 'dark')).toBe('dark')
    expect(getStoredValue('theme', 'light')).toBe('dark')
    expect(getStoredValue('missing', 'light')).toBe('light')
    expect(setStoredArray('mixed', ['era-cloud', 'era-cloud', null, 42])).toEqual([
      'era-cloud',
    ])
    expect(getStoredArray('mixed')).toEqual(['era-cloud'])
  })
})
