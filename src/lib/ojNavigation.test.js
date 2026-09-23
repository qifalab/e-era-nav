import { describe, expect, it } from 'vitest'
import { buildOjLocation, legacyOjRedirect, parseOjLocation } from './ojNavigation'

describe('canonical OJ routes', () => {
  it('maps embedded bookmarks without changing their external destination', () => {
    expect(legacyOjRedirect('?namespace=oj')).toBe('/oj/')
    expect(legacyOjRedirect('?namespace=oj&category=oj-contest&service=leetcode-cn')).toBe('/oj/?category=platform&service=leetcode')
    expect(legacyOjRedirect('?namespace=oj&service=nowcoder-tracker')).toBe('/oj/?category=learn&service=nowcoder-study')
    expect(legacyOjRedirect('?namespace=oj&category=oj-contest')).toBe('/oj/?category=contest')
    expect(legacyOjRedirect('?namespace=oj&service=yuantiji')).toBe('/oj/?category=contest&service=yuantiji')
    expect(legacyOjRedirect('?category=products')).toBeNull()
  })
  it.each(['toString','constructor','__proto__','javascript:alert(1)'])('rejects unsafe or inherited slug %s', slug => {
    expect(parseOjLocation(`?category=${slug}&service=${slug}`)).toEqual({ category: 'all', service: null, query: '' })
  })
  it('roundtrips category and encoded search state', () => {
    const state = { category: 'contest', service: null, query: 'XCPC & 比赛' }
    expect(parseOjLocation(new URL(buildOjLocation(state), 'https://nav.emoera.com').search)).toEqual(state)
  })
})
