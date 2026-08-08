import { useEffect, useRef, useState } from 'react'

/* 共享：进入视口检测器（IntersectionObserver） */
export function useInView(options = {}) {
  const { threshold = 0.15, once = true, rootMargin = '0px' } = options
  const ref = useRef(null)
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) obs.unobserve(entry.target)
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, once, rootMargin])

  return [ref, inView]
}

/* =========================================================
 * 1. 文字波浪反弹悬停（Text Wave Ripple Hover）
 * 将文本拆分为单字，鼠标悬停父级时通过 transition-delay
 * 差值 + cubic-bezier 弹性曲线，字母呈波浪状顺序向上反弹。
 * ========================================================= */
export function WaveText({ text, gradient = false, className = '' }) {
  const chars = Array.from(text)
  return (
    <span
      className={`fx-wave ${gradient ? 'fx-wave--grad' : ''} ${className}`.trim()}
      aria-label={text}
    >
      {chars.map((ch, i) => (
        <span
          key={i}
          className="fx-wave__char"
          style={{ '--i': i }}
          aria-hidden="true"
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}

/* =========================================================
 * 2. 文字逐行显现（Line Reveal）
 * 按行分割，每行以错开延迟从底部淡入上移显现。
 * ========================================================= */
export function RevealLines({ lines, className = '', as: Tag = 'p', stagger = 0.12, ...rest }) {
  const [ref, inView] = useInView({ threshold: 0.2 })
  return (
    <Tag ref={ref} className={`fx-reveal ${className} ${inView ? 'is-in' : ''}`.trim()} {...rest}>
      {lines.map((line, i) => (
        <span key={i} className="fx-reveal__mask">
          <span
            className="fx-reveal__line"
            style={{ transitionDelay: `${i * stagger}s` }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  )
}

/* =========================================================
 * 3. 淡入上移（Fade In Up）
 * 元素进入视口时透明度从 0 渐显到 1，位置从下方轻微上移。
 * ========================================================= */
export function FadeInUp({ children, className = '', delay = 0, as: Tag = 'div', ...rest }) {
  const [ref, inView] = useInView({ threshold: 0.12 })
  return (
    <Tag
      ref={ref}
      className={`fx-fade-up ${className} ${inView ? 'is-in' : ''}`.trim()}
      style={{ transitionDelay: `${delay}s` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
