import '@testing-library/jest-dom/vitest'

// Node 25 exposes an experimental localStorage global that can shadow jsdom's
// Storage implementation inside Vitest. Use a small in-memory implementation so
// application and tests always share the same storage API.
class MemoryStorage {
  #values = new Map()

  get length() {
    return this.#values.size
  }

  clear() {
    this.#values.clear()
  }

  getItem(key) {
    return this.#values.has(String(key)) ? this.#values.get(String(key)) : null
  }

  key(index) {
    return [...this.#values.keys()][index] ?? null
  }

  removeItem(key) {
    this.#values.delete(String(key))
  }

  setItem(key, value) {
    this.#values.set(String(key), String(value))
  }
}

const memoryStorage = new MemoryStorage()
for (const target of new Set([globalThis, window])) {
  Object.defineProperty(target, 'localStorage', {
    configurable: true,
    writable: true,
    value: memoryStorage,
  })
}

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  configurable: true,
  writable: true,
  value: IntersectionObserverMock,
})

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
})

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: () => {},
})

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true
  }
}

if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function close() {
    this.open = false
  }
}

Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
  configurable: true,
  value() {
    this.open = true
  },
})

Object.defineProperty(HTMLDialogElement.prototype, 'close', {
  configurable: true,
  value() {
    this.open = false
  },
})
