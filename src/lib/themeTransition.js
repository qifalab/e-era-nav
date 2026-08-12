const REVEAL_DURATION = 520
const FADE_CLASS = 'theme-fading'
const FADE_DURATION = 340

let fadeTimer = 0

function supportsViewTransition() {
  return (
    typeof document !== 'undefined' &&
    typeof document.startViewTransition === 'function' &&
    typeof document.documentElement.animate === 'function'
  )
}

function runFallback(apply) {
  const root = document.documentElement
  root.classList.add(FADE_CLASS)
  apply()
  window.clearTimeout(fadeTimer)
  fadeTimer = window.setTimeout(() => root.classList.remove(FADE_CLASS), FADE_DURATION)
}

function readOrigin(origin) {
  const rect = origin?.getBoundingClientRect?.()
  if (!rect || (rect.width === 0 && rect.height === 0)) {
    return { x: window.innerWidth - 72, y: 48 }
  }
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

export function runThemeTransition({ origin, reducedMotion = false, apply }) {
  if (typeof apply !== 'function') return

  if (typeof document === 'undefined' || reducedMotion) {
    apply()
    return
  }

  if (!supportsViewTransition()) {
    runFallback(apply)
    return
  }

  const root = document.documentElement
  const { x, y } = readOrigin(origin)
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )

  root.dataset.themeTransition = 'reveal'

  let transition
  try {
    transition = document.startViewTransition(apply)
  } catch {
    delete root.dataset.themeTransition
    runFallback(apply)
    return
  }

  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: REVEAL_DURATION,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
    .catch(() => {})

  const clear = () => delete root.dataset.themeTransition
  transition.finished.then(clear, clear)
}
