import {
  ojCategories,
  ojCategoryBySlug,
  ojServiceBySlug,
  ojServicesByCategory,
} from '../data/ojResources'
import {
  categories,
  categoryBySlug,
  serviceBySlug,
  services,
  servicesByCategory,
} from '../data/services'

export const NAMESPACES = Object.freeze({
  MAIN: 'main',
  OJ: 'oj',
})

function buildUrlSet(list) {
  const set = new Set()
  list.forEach((entry) => {
    try {
      set.add(new URL(entry.url).href)
    } catch {
      // ignore malformed URLs
    }
  })
  return set
}

const mainDestinationSet = buildUrlSet(services)
const ojDestinationSet = buildUrlSet(
  ojCategories.flatMap((category) => ojServicesByCategory[category.slug]),
)

function pickDestinationSet(namespace) {
  return namespace === NAMESPACES.OJ ? ojDestinationSet : mainDestinationSet
}

export function createSpatialState(category = null, service = null, namespace = NAMESPACES.MAIN) {
  const safeNamespace = namespace === NAMESPACES.OJ ? NAMESPACES.OJ : NAMESPACES.MAIN
  const serviceTable = safeNamespace === NAMESPACES.OJ ? ojServiceBySlug : serviceBySlug
  const categoryTable = safeNamespace === NAMESPACES.OJ ? ojCategoryBySlug : categoryBySlug

  const safeService = serviceTable[service] ? service : null
  const derivedCategory = safeService ? serviceTable[safeService].category : null
  const safeCategory = derivedCategory || (categoryTable[category] ? category : null)

  return {
    namespace: safeNamespace,
    category: safeCategory,
    service: safeService,
  }
}

export function parseLocation(search = '') {
  const params = new URLSearchParams(search)
  return createSpatialState(
    params.get('category'),
    params.get('service'),
    params.get('namespace'),
  )
}

export function buildLocation(state) {
  const safeState = createSpatialState(state?.category, state?.service, state?.namespace)
  const params = new URLSearchParams()

  if (safeState.namespace && safeState.namespace !== NAMESPACES.MAIN) {
    params.set('namespace', safeState.namespace)
  }
  if (safeState.category) params.set('category', safeState.category)
  if (safeState.service) params.set('service', safeState.service)

  const query = params.toString()
  return query ? `/?${query}` : '/'
}

export function isSafeExternalUrl(value, namespace = NAMESPACES.MAIN) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false
    return pickDestinationSet(namespace).has(url.href)
  } catch {
    return false
  }
}

export function spatialParent(state) {
  const safeState = createSpatialState(state?.category, state?.service, state?.namespace)
  if (safeState.service) {
    return createSpatialState(safeState.category, null, safeState.namespace)
  }
  return createSpatialState(null, null, safeState.namespace)
}

export function listAllServicesForNamespace(namespace) {
  if (namespace === NAMESPACES.OJ) {
    return ojCategories.flatMap((category) => ojServicesByCategory[category.slug])
  }
  return services
}

export function listAllCategoriesForNamespace(namespace) {
  if (namespace === NAMESPACES.OJ) return ojCategories
  return categories
}

// Convenience wrappers used by App + Directory. Each returns the appropriate
// per-namespace tables so JSX can stay schema-agnostic.
export function getServiceBySlug(namespace = NAMESPACES.MAIN) {
  return namespace === NAMESPACES.OJ ? ojServiceBySlug : serviceBySlug
}

export function getCategoryBySlug(namespace = NAMESPACES.MAIN) {
  return namespace === NAMESPACES.OJ ? ojCategoryBySlug : categoryBySlug
}

export function getServicesByCategory(namespace = NAMESPACES.MAIN) {
  return namespace === NAMESPACES.OJ ? ojServicesByCategory : servicesByCategory
}
