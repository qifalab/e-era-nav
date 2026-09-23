import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, BookOpen, Code2, Globe, Lightbulb, Search, Trophy, X } from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { categories, ojs } from './OjData'
import { buildOjLocation, parseOjLocation } from '../lib/ojNavigation'
import { getStoredValue, preferenceKeys, setStoredValue } from '../lib/preferences'
import './OjApp.css'

const icons = { info: Globe, learn: BookOpen, platform: Code2, contest: Trophy, dev: Code2 }
const categoryNames = Object.fromEntries(categories.map(item => [item.id, item.name]))

export default function OjApp() {
  const [theme, setTheme] = useState(() => getStoredValue(preferenceKeys.theme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const [state, setState] = useState(() => parseOjLocation(window.location.search))
  const searchRef = useRef(null)
  const targetRef = useRef(null)
  const query = state.query

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    setStoredValue(preferenceKeys.theme, theme)
  }, [theme])

  useEffect(() => {
    document.title = '刷题导航 · E时代导航'
    window.history.replaceState({ ...window.history.state }, '', buildOjLocation(parseOjLocation(window.location.search)))
    const restore = () => setState(parseOjLocation(window.location.search))
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [])

  // A shared/bookmarked resource is revealed in its category without leaving the site.
  useEffect(() => {
    if (!state.service) return
    const frame = window.requestAnimationFrame(() => {
      targetRef.current?.scrollIntoView({ block: 'center' })
      targetRef.current?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [state.service])

  const navigate = useCallback((next, replace = false) => {
    const method = replace ? 'replaceState' : 'pushState'
    window.history[method]({}, '', buildOjLocation(next))
    setState(next)
  }, [])

  useEffect(() => {
    const shortcuts = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.scrollIntoView({ block: 'center' })
        searchRef.current?.focus()
      } else if (event.altKey && event.key.toLowerCase() === 'o') {
        window.location.assign('/')
      }
    }
    window.addEventListener('keydown', shortcuts)
    return () => window.removeEventListener('keydown', shortcuts)
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('zh-CN')
    return ojs.filter(item => (state.category === 'all' || item.category === state.category)
      && (!needle || `${item.name}${item.description}${item.tags.join('')}`.toLocaleLowerCase('zh-CN').includes(needle)))
  }, [query, state.category])

  return (
    <div className="practice-page">
      <a className="skip-link" href="#oj-grid">跳到刷题资源列表</a>
      <SiteHeader section="practice" theme={theme} onTheme={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} />
      <main className="site-main">
        <div className="page-intro">
          <div><h1>刷题导航</h1><p>算法学习、在线评测与竞赛资源</p></div>
          <label className="catalog-search">
            <Search aria-hidden="true" />
            <input ref={searchRef} type="search" value={query} placeholder="搜索平台、教程、竞赛资源…" aria-label="搜索刷题平台"
              onChange={event => navigate({ ...state, query: event.target.value, service: null }, true)}
              onKeyDown={event => { if (event.key === 'Escape') navigate({ ...state, query: '', service: null }, true) }} />
            {query ? <button type="button" onClick={() => { navigate({ ...state, query: '', service: null }, true); searchRef.current?.focus() }} aria-label="清除搜索"><X aria-hidden="true" /></button> : <kbd aria-hidden="true">⌘K</kbd>}
          </label>
        </div>
        <nav className="catalog-filters practice-filters" aria-label="刷题资源分类">
          {categories.map(category => (
            <button type="button" key={category.id} aria-pressed={state.category === category.id}
              style={{ '--category-color': category.accent }}
              onClick={() => navigate({ category: category.id, query, service: null })}>
              {category.id !== 'all' && <span className="category-dot" aria-hidden="true" />}
              {category.name}<small>{category.id === 'all' ? ojs.length : ojs.filter(item => item.category === category.id).length}</small>
            </button>
          ))}
        </nav>
        <div className="directory-summary"><h2>{state.category === 'all' ? '全部资源' : categoryNames[state.category]}</h2><span role="status">{filtered.length} 个资源</span></div>
        <section id="oj-grid" aria-label="刷题资源列表">
          {filtered.length ? <div className="catalog-grid">
            {filtered.map(item => {
              const Icon = icons[item.category]
              return <article key={item.slug} id={`resource-${item.slug}`} style={{ '--card-color': item.accent }} className={`catalog-card ${state.service === item.slug ? 'is-selected' : ''}`}>
                <a ref={state.service === item.slug ? targetRef : undefined} href={item.url} target="_blank" rel="noopener noreferrer nofollow" aria-label={`访问 ${item.name}`}>
                  <div className="catalog-card__head"><span className="catalog-card__icon"><Icon aria-hidden="true" /></span><h3>{item.name}</h3></div>
                  <p className="catalog-card__description">{item.description}</p>
                  <div className="catalog-card__meta"><span>{item.tags.join(' · ')}</span><ArrowUpRight aria-hidden="true" /></div>
                </a>
              </article>
            })}
          </div> : <div className="catalog-empty"><p>没有匹配的平台或资源</p><button type="button" onClick={() => navigate({ category: 'all', query: '', service: null })}>清除筛选，查看全部</button></div>}
        </section>
        <section className="practice-tip" aria-label="刷题小贴士">
          <h2><Lightbulb aria-hidden="true" />训练建议</h2>
          <ul>
            <li><strong>入门</strong><span>洛谷、计蒜客、力扣简单题，建立练习节奏。</span></li>
            <li><strong>进阶</strong><span>力扣中等题、AcWing 题单、OI Wiki，理解常用算法。</span></li>
            <li><strong>竞赛</strong><span>Codeforces、AtCoder，每周比赛与赛后补题。</span></li>
            <li><strong>求职</strong><span>牛客、力扣企业题库，结合面经进行练习。</span></li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
