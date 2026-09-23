import { categories, ojs } from '../oj/OjData'

export const legacyOjCategoryMap = Object.freeze({
  'oj-info': 'info', 'oj-basics': 'learn', 'oj-practice': 'platform',
  'oj-contest': 'contest', 'oj-dev': 'dev',
})
export const legacyOjServiceMap = Object.freeze({
  'nowcoder-tracker': 'nowcoder-study', 'nowcoder-practice': 'nowcoder', 'leetcode-cn': 'leetcode',
})
const bySlug = new Map(ojs.map(item => [item.slug, item]))
const categoryIds = new Set(categories.map(item => item.id))

/** A valid resource determines its category; all other URL input is bounded/validated. */
export function parseOjLocation(search = '') {
  const params = new URLSearchParams(search)
  const oldSlug = params.get('service')
  const mapped = Object.hasOwn(legacyOjServiceMap, oldSlug) ? legacyOjServiceMap[oldSlug] : oldSlug
  const item = bySlug.get(mapped)
  const rawCategory = params.get('category')
  const mappedCategory = Object.hasOwn(legacyOjCategoryMap, rawCategory) ? legacyOjCategoryMap[rawCategory] : rawCategory
  return {
    category: item?.category || (categoryIds.has(mappedCategory) ? mappedCategory : 'all'),
    service: item?.slug || null,
    query: item ? '' : (params.get('q') || '').slice(0, 200),
  }
}

export function buildOjLocation(state) {
  const params = new URLSearchParams()
  if (categoryIds.has(state.category) && state.category !== 'all') params.set('category', state.category)
  if (bySlug.has(state.service)) params.set('service', state.service)
  if (state.query?.trim()) params.set('q', state.query.trim().slice(0, 200))
  return `/oj/${params.size ? `?${params}` : ''}`
}

export function legacyOjRedirect(search) {
  return new URLSearchParams(search).get('namespace') === 'oj'
    ? buildOjLocation(parseOjLocation(search)) : null
}
