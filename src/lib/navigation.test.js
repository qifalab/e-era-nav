import { describe, expect, it } from 'vitest'
import {
  buildLocation,
  createSpatialState,
  isSafeExternalUrl,
  parseLocation,
  spatialParent,
} from './navigation'

describe('spatial URL state', () => {
  it('parses valid category and service deep links', () => {
    expect(parseLocation('?category=ecosystem&service=era-git')).toEqual({
      category: 'ecosystem',
      service: 'era-git',
    })
  })

  it('derives the category from a valid service', () => {
    expect(parseLocation('?service=era-oj')).toEqual({
      category: 'team',
      service: 'era-oj',
    })
  })

  it('rejects stale and malicious URL state', () => {
    expect(parseLocation('?category=%3Cscript%3E&service=javascript%3Aalert(1)')).toEqual({
      category: null,
      service: null,
    })
  })

  it.each(['toString', 'constructor', '__proto__'])(
    'rejects inherited object key %s',
    (service) => {
      expect(parseLocation(`?service=${service}`)).toEqual({
        category: null,
        service: null,
      })
    },
  )

  it('serializes only valid state', () => {
    expect(buildLocation(createSpatialState('products', 'era-cloud'))).toBe(
      '/?category=products&service=era-cloud',
    )
    expect(buildLocation(createSpatialState(null, null))).toBe('/')
  })

  it('moves one level up without losing the current region', () => {
    expect(spatialParent({ category: 'products', service: 'era-cloud' })).toEqual({
      category: 'products',
      service: null,
    })
    expect(spatialParent({ category: 'products', service: null })).toEqual({
      category: null,
      service: null,
    })
  })
})

describe('external URL safety', () => {
  it('permits known HTTPS services', () => {
    expect(isSafeExternalUrl('https://account.emoera.com/')).toBe(true)
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'http://account.emoera.com/',
    'https://evil.example/',
    'not a url',
  ])('rejects untrusted destination %s', (url) => {
    expect(isSafeExternalUrl(url)).toBe(false)
  })
})
