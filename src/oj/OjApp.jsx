import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowUpRight,
  GraduationCap,
  Layers3,
  Lightbulb,
  Moon,
  Search,
  Sparkles,
  Sun,
  Trophy,
  Briefcase,
  Code2,
  PlayCircle,
} from 'lucide-react'
import { categories, ojs, stats, tipsVideo } from './OjData'
import { WaveText, RevealLines, FadeInUp } from './effects'
import './OjApp.css'

const THEME_KEY = 'e-era:theme'
const PREFERS_DARK = '(prefers-color-scheme: dark)'
const EXTERNAL_LINK_REL = 'noopener noreferrer nofollow'

function readStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia(PREFERS_DARK).matches) {
    return 'dark'
  }
  return 'light'
}

function persistTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* ignore */
  }
}

function CategoryIcon({ id, className }) {
  if (id === 'learn') return <GraduationCap className={className} aria-hidden="true" />
  if (id === 'platform') return <Code2 className={className} aria-hidden="true" />
  if (id === 'contest') return <Trophy className={className} aria-hidden="true" />
  if (id === 'dev') return <Briefcase className={className} aria-hidden="true" />
  return <Layers3 className={className} aria-hidden="true" />
}

function OjCard({ oj, index }) {
  const initial = oj.name.replace(/[^\u4e00-\u9fa5A-Za-z]/g, '').charAt(0)
  return (
    <motion.article
      className="oj-card"
      style={{ '--card-accent': oj.accent }}
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 320,
        damping: 24,
        mass: 0.7,
        delay: Math.min(index * 0.035, 0.4),
      }}
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
    >
      <header className="oj-card__head">
        <span className="oj-card__logo" aria-hidden="true">
          {initial}
        </span>
        <div className="oj-card__titles">
          <h3>
            {oj.name}
            {oj.badge && <em className="oj-card__badge">{oj.badge}</em>}
          </h3>
          <p>{oj.description}</p>
        </div>
      </header>
      <footer className="oj-card__foot">
        <ul className="oj-card__tags" aria-label="标签">
          {oj.tags.map((tag) => (
            <li key={tag}>#{tag}</li>
          ))}
        </ul>
        <a
          className="oj-card__visit"
          href={oj.url}
          target="_blank"
          rel={EXTERNAL_LINK_REL}
          aria-label={`访问 ${oj.name}`}
        >
          前往
          <ArrowUpRight aria-hidden="true" />
        </a>
      </footer>
    </motion.article>
  )
}

function StatsBlock() {
  return (
    <div className="oj-stats" aria-label="站点概览">
      <div>
        <strong>{stats.ojs}</strong>
        <span>收录平台</span>
      </div>
      <div>
        <strong>{stats.learn}</strong>
        <span>基础学习</span>
      </div>
      <div>
        <strong>{stats.platform}</strong>
        <span>刷题平台</span>
      </div>
      <div>
        <strong>{stats.contest + stats.dev}</strong>
        <span>资源拓展</span>
      </div>
    </div>
  )
}

export default function OjApp() {
  const [theme, setTheme] = useState(readStoredTheme)
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    persistTheme(theme)
  }, [theme])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return ojs.filter((oj) => {
      const passCategory = activeCategory === 'all' || oj.category === activeCategory
      if (!passCategory) return false
      if (!needle) return true
      return (
        oj.name.toLowerCase().includes(needle) ||
        oj.description.toLowerCase().includes(needle) ||
        oj.tags.some((t) => t.toLowerCase().includes(needle))
      )
    })
  }, [activeCategory, query])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="oj-shell">
      <a className="oj-skip" href="#oj-grid">
        跳到刷题平台列表
      </a>

      <header className="oj-header">
        <div className="oj-header__inner">
          <div className="oj-brand">
            <picture className="oj-brand__mark">
              <source
                type="image/webp"
                srcSet="/brand/e-era-logo-96.webp 1x, /brand/e-era-logo-192.webp 2x"
              />
              <img
                src="/brand/e-era-logo-96.png"
                srcSet="/brand/e-era-logo-96.png 1x, /brand/e-era-logo-192.png 2x"
                width="38"
                height="38"
                alt="E时代品牌标识"
              />
            </picture>
            <span className="oj-brand__copy">
              <strong>E时代社团服务导航</strong>
              <small>独立刷题导航副站</small>
            </span>
          </div>

          <label className="oj-search">
            <Search aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索平台、标签、关键字…"
              aria-label="搜索刷题平台"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="清除搜索">
                ×
              </button>
            )}
          </label>

          <div className="oj-header__actions">
            <a className="oj-back" href="/" aria-label="返回主站导航">
              <ArrowLeft aria-hidden="true" />
              <span>返回主站</span>
            </a>
            <button
              type="button"
              className="oj-icon-btn"
              onClick={toggleTheme}
              aria-label={`切换到${theme === 'dark' ? '浅色' : '深色'}主题`}
            >
              {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <motion.section
          className="oj-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          <div className="oj-hero__bg" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="oj-hero__content">
            <p className="oj-eyebrow">
              <Sparkles aria-hidden="true" /> OJ · 在线评测
            </p>
            <h1 className="oj-hero__title">
              <WaveText text="让每一次" />
              <WaveText text="刷题都更高效" gradient />
            </h1>
            <RevealLines
              className="oj-hero__desc"
              lines={[
                `收录 ${stats.ojs} 个主流算法与编程学习平台，覆盖基础学习、刷题、竞赛资源、软件开发全场景。`,
                '点开即用，专注训练。',
              ]}
            />
            <FadeInUp delay={0.15}>
              <StatsBlock />
            </FadeInUp>
          </div>
        </motion.section>

        <section className="oj-tabs" aria-label="按分类筛选">
          <div className="oj-tabs__inner">
            {categories.map((cat) => {
              const count =
                cat.id === 'all' ? ojs.length : ojs.filter((o) => o.category === cat.id).length
              const active = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`oj-tab ${active ? 'is-active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{ '--tab-accent': cat.accent }}
                  aria-pressed={active}
                >
                  <CategoryIcon id={cat.id} className="oj-tab__icon" />
                  <span>{cat.name}</span>
                  <em>{count}</em>
                </button>
              )
            })}
          </div>
        </section>

        <section className="oj-grid" id="oj-grid" aria-live="polite">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((oj, index) => <OjCard key={oj.slug} oj={oj} index={index} />)
            ) : (
              <motion.div
                key="empty"
                className="oj-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p>没有匹配的平台</p>
                <small>试试别的关键字，或切换到「全部」分类</small>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <FadeInUp as="section" className="oj-tip" aria-label="刷题小贴士">
          <h2>
            <Lightbulb aria-hidden="true" /> 训练建议
          </h2>
          <ol>
            <li>
              <strong>入门</strong>：洛谷 / 计蒜客 / 力扣简单难度，建立刷题节奏。
            </li>
            <li>
              <strong>进阶</strong>：力扣中等 / AcWing 题单 / OI Wiki，理解常用算法套路。
            </li>
            <li>
              <strong>冲榜</strong>：Codeforces / AtCoder 每周比赛，锻炼临场与抗压。
            </li>
            <li>
              <strong>求职</strong>：牛客 / 力扣企业题库，结合面经针对性练习。
            </li>
          </ol>
          <a
            className="oj-tip__video"
            href={tipsVideo.url}
            target="_blank"
            rel={EXTERNAL_LINK_REL}
          >
            <PlayCircle aria-hidden="true" />
            <span>
              <strong>{tipsVideo.title}</strong>
              <small>{tipsVideo.url}</small>
            </span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </FadeInUp>
      </main>

      <FadeInUp as="footer" className="oj-footer" delay={0.1}>
        <div>
          <strong>E时代 · 刷题导航</strong>
          <small>独立子站 · 与主导航分离维护</small>
        </div>
        <nav aria-label="站点相关链接">
          <a href="https://we.emoera.com/" target="_blank" rel={EXTERNAL_LINK_REL}>
            关于我们
          </a>
          <a href="https://www.qifalab.cn/" target="_blank" rel={EXTERNAL_LINK_REL}>
            技术支持
          </a>
          <a href="/">返回主站</a>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel={EXTERNAL_LINK_REL}
          >
            蜀ICP备2024055741号
          </a>
        </nav>
        <span>© {new Date().getFullYear()} E时代科技</span>
      </FadeInUp>
    </div>
  )
}
