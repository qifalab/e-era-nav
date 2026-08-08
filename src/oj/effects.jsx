import { useInView } from './useInView'

/* =========================================================
 * 1. 文字波浪反弹悬停（Text Wave Ripple Hover）
 * 将文本拆分为单字，鼠标悬停父级时通过 transition-delay
 * 差值 + cubic-bezier 弹性曲线，字母呈波浪状顺序向上反弹。
 * ========================================================= */
export function WaveText({ text, gradient = false, className = '' }) {
  const chars = Array.from(text)
  return (
    <span
      className={`oj-wave ${gradient ? 'oj-wave--grad' : ''} ${className}`.trim()}
    >
      <span className="oj-visually-hidden">{text}</span>
      {chars.map((ch, i) => (
        <span
          key={i}
          className="oj-wave__char"
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
export function RevealLines({ lines, className = '', as: Tag = 'p', stagger = 0.12 }) {
  const [ref, inView] = useInView({ threshold: 0.2 })
  return (
    <Tag ref={ref} className={`oj-reveal ${className} ${inView ? 'is-in' : ''}`.trim()}>
      {lines.map((line, i) => (
        <span key={i} className="oj-reveal__mask">
          <span
            className="oj-reveal__line"
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
export function FadeInUp({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
  ...props
}) {
  const [ref, inView] = useInView({ threshold: 0.12 })
  return (
    <Tag
      {...props}
      ref={ref}
      className={`oj-fade-up ${className} ${inView ? 'is-in' : ''}`.trim()}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </Tag>
  )
}
