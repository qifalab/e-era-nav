import { categoryBySlug, serviceBySlug, services } from '../data/services'

const allowedDestinations = new Set(services.map((service) => new URL(service.url).href))

export function createSpatialState(category = null, service = null) {
  const safeService = serviceBySlug[service] ? service : null
  const derivedCategory = safeService ? serviceBySlug[safeService].category : null
  const safeCategory = derivedCategory || (categoryBySlug[category] ? category : null)

  return {
    category: safeCategory,
    service: safeService,
  }
}

export function parseLocation(search = '') {
  const params = new URLSearchParams(search)
  return createSpatialState(params.get('category'), params.get('service'))
}

export function buildLocation(state) {
  const safeState = createSpatialState(state?.category, state?.service)
  const params = new URLSearchParams()

  if (safeState.category) params.set('category', safeState.category)
  if (safeState.service) params.set('service', safeState.service)

  const query = params.toString()
  return query ? `/?${query}` : '/'
}

export function isSafeExternalUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && allowedDestinations.has(url.href)
  } catch {
    return false
  }
}

export function spatialParent(state) {
  const safeState = createSpatialState(state?.category, state?.service)
  if (safeState.service) return createSpatialState(safeState.category, null)
  return createSpatialState(null, null)
}
