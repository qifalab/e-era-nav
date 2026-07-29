export const preferenceKeys = {
  recent: 'e-era:recent',
  theme: 'e-era:theme',
  renderMode: 'e-era:render-mode',
  introSeen: 'e-era:intro-seen',
}

export function getStoredArray(key) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]')
    return Array.isArray(parsed)
      ? parsed
          .filter((item) => typeof item === 'string' && item.length <= 80)
          .slice(0, 32)
      : []
  } catch {
    return []
  }
}

export function setStoredArray(key, value) {
  const safeValue = Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (item) => typeof item === 'string' && item.length <= 80,
          ),
        ),
      ].slice(0, 32)
    : []

  try {
    window.localStorage.setItem(key, JSON.stringify(safeValue))
  } catch {
    // Private browsing and full storage must not break navigation.
  }

  return safeValue
}

export function addRecentService(key, value, limit = 6) {
  const current = getStoredArray(key)
  return setStoredArray(key, [value, ...current.filter((item) => item !== value)].slice(0, limit))
}

export function getStoredValue(key, fallback = null) {
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export function setStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Preferences are optional enhancements.
  }
  return value
}
