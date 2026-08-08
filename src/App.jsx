import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { motion as Motion } from 'framer-motion'
import {
  Box,
  ChevronRight,
  CircleHelp,
  KeyRound,
  Layers,
  Monitor,
  Moon,
  Search,
  Sun,
  Terminal,
  Users,
  WifiOff,
  X,
} from 'lucide-react'
import './SpatialApp.css'
import { FadeInUp, RevealLines, WaveText } from './oj/effects'
import Directory from './components/Directory'
import Modal from './components/Modal'
import SceneErrorBoundary from './components/SceneErrorBoundary'
import ServiceCardFace from './components/ServiceCardFace'
import {
  categories,
  categoryBySlug,
  serviceBySlug,
  services,
  servicesByCategory,
} from './data/services'
import { detectCapabilities } from './lib/capabilities'
import {
  buildLocation,
  createSpatialState,
  isSafeExternalUrl,
  parseLocation,
  spatialParent,
} from './lib/navigation'
import {
  addRecentService,
  getStoredArray,
  getStoredValue,
  preferenceKeys,
  setStoredValue,
} from './lib/preferences'
import { runThemeTransition } from './lib/themeTransition'

const SpatialScene = lazy(() => import('./scene/SpatialScene'))

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}

function normalize(value) {
  return value.toLocaleLowerCase('zh-CN').replace(/\s+/g, '')
}

function CategoryGlyph({ id, className }) {
  if (id === 'members') return <Users className={className} aria-hidden="true" />
  if (id === 'products') return <Box className={className} aria-hidden="true" />
  if (id === 'ecosystem') return <KeyRound className={className} aria-hidden="true" />
  return <Layers className={className} aria-hidden="true" />
}

function BreadcrumbTrail({
  category,
  service,
  onHome,
  onCategory,
  className = '',
}) {
  if (!category) return null
  return (
    <nav className={`breadcrumbs ${className}`} aria-label="当前服务路径">
      <button type="button" onClick={onHome}>
        总览
      </button>
      <span className="breadcrumbs__separator" aria-hidden="true">
        /
      </span>
      {service ? (
        <>
          <button type="button" onClick={() => onCategory(category.slug)}>
            {category.name}
          </button>
          <span className="breadcrumbs__separator" aria-hidden="true">
            /
          </span>
          <span aria-current="page">{service.name}</span>
        </>
      ) : (
        <span aria-current="page">{category.name}</span>
      )}
    </nav>
  )
}

function App() {
  const capabilities = useMemo(() => detectCapabilities(), [])
  const compactViewport = window.matchMedia('(max-width: 720px)').matches
  const [spatialState, setSpatialState] = useState(() => parseLocation(window.location.search))
  const [theme, setTheme] = useState(() => {
    const stored = getStoredValue(preferenceKeys.theme)
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [renderMode, setRenderMode] = useState(() => {
    const stored = getStoredValue(preferenceKeys.renderMode)
    if (stored === '2d') return '2d'
    if (stored === '3d' && capabilities.recommendedMode === '3d') return '3d'
    if (compactViewport) return '2d'
    return capabilities.recommendedMode
  })
  const [modeNotice, setModeNotice] = useState(() =>
    capabilities.recommendedMode === '2d'
      ? '已根据设备能力启用轻量 2D 模式。'
      : compactViewport
        ? '已根据小屏触控条件启用轻量 2D 模式。'
        : '',
  )
  const [recent, setRecent] = useState(() => getStoredArray(preferenceKeys.recent))
  const [query, setQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [activeSearchIndex, setActiveSearchIndex] = useState(0)
  const [helpOpen, setHelpOpen] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [cameraRevision, setCameraRevision] = useState(0)
  const [hoveredService, setHoveredService] = useState(null)
  const searchRef = useRef(null)
  const helpTriggerRef = useRef(null)
  const themeButtonRef = useRef(null)
  const helpWasOpenedRef = useRef(false)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const selectedService = serviceBySlug[spatialState.service] || null
  const selectedCategory = categoryBySlug[spatialState.category] || null
  const modalOpen = Boolean(selectedService || helpOpen)
  const openHelp = useCallback(() => {
    helpWasOpenedRef.current = true
    setHelpOpen(true)
  }, [])

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    runThemeTransition({
      origin: themeButtonRef.current,
      reducedMotion,
      apply: () => {
        // Paint the new palette before the snapshot is taken, then keep React in sync
        // synchronously so the sun/moon glyph belongs to the same frame.
        document.documentElement.dataset.theme = next
        document.documentElement.style.colorScheme = next
        flushSync(() => setTheme(next))
      },
    })
  }, [reducedMotion, theme])

  const searchResults = useMemo(() => {
    const needle = normalize(query)
    if (!needle) return []
    return services
      .filter((service) =>
        normalize(`${service.name}${service.description}${categoryBySlug[service.category].name}`).includes(
          needle,
        ),
      )
      .slice(0, 7)
  }, [query])

  const navigateSpatial = useCallback((nextState, replace = false) => {
    const safeState = createSpatialState(nextState?.category, nextState?.service)
    const currentState = parseLocation(window.location.search)
    if (
      currentState.category === safeState.category &&
      currentState.service === safeState.service
    ) {
      setSpatialState(safeState)
      return
    }
    const method = replace ? 'replaceState' : 'pushState'
    window.history[method]({ eraSpatial: safeState }, '', buildLocation(safeState))
    setSpatialState(safeState)
  }, [])

  const focusCategory = useCallback(
    (slug) => {
      navigateSpatial(createSpatialState(slug, null))
      if (renderMode === '2d') {
        window.requestAnimationFrame(() => {
          document
            .getElementById(`region-${slug}`)
            ?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' })
        })
      }
    },
    [navigateSpatial, reducedMotion, renderMode],
  )

  const focusService = useCallback(
    (slug) => {
      const service = serviceBySlug[slug]
      if (!service) return
      setQuery('')
      setMobileSearchOpen(false)
      navigateSpatial(createSpatialState(service.category, service.slug))
    },
    [navigateSpatial],
  )

  const goHome = useCallback(
    () => {
      setCameraRevision((revision) => revision + 1)
      navigateSpatial(createSpatialState(null, null))
    },
    [navigateSpatial],
  )

  const goBack = useCallback(
    () => navigateSpatial(spatialParent(spatialState), true),
    [navigateSpatial, spatialState],
  )

  const closeService = useCallback(() => {
    navigateSpatial(spatialParent(spatialState), true)
  }, [navigateSpatial, spatialState])

  useEffect(() => {
    window.history.replaceState({ eraSpatial: spatialState }, '', buildLocation(spatialState))
    const handlePopState = () => {
      setHelpOpen(false)
      setSpatialState(parseLocation(window.location.search))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
    // Initial state is intentionally canonicalized once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    setStoredValue(preferenceKeys.theme, theme)
  }, [theme])

  useEffect(() => {
    if (helpOpen || !helpWasOpenedRef.current) return
    helpWasOpenedRef.current = false
    helpTriggerRef.current?.focus()
  }, [helpOpen])

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const handleShortcut = (event) => {
      if (modalOpen) return
      const target = event.target
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      if (editing && event.key !== 'Escape') return

      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        if (compactViewport) {
          setMobileSearchOpen(true)
          window.requestAnimationFrame(() => searchRef.current?.focus())
        } else {
          searchRef.current?.focus()
        }
      } else if (event.altKey && event.key.toLowerCase() === 'h') {
        goHome()
      } else if (event.altKey && event.key.toLowerCase() === 'b') {
        goBack()
      } else if (event.altKey && event.key === '?') {
        openHelp()
      } else if (event.altKey && ['1', '2', '3', '4'].includes(event.key)) {
        focusCategory(categories[Number(event.key) - 1].slug)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [compactViewport, focusCategory, goBack, goHome, modalOpen, openHelp])

  const switchRenderMode = () => {
    if (renderMode === '2d') {
      if (!capabilities.webgl) {
        setModeNotice('此设备无法建立 WebGL 上下文，继续使用 2D 服务列表。')
        return
      }
      setRenderMode('3d')
      setModeNotice('')
      setStoredValue(preferenceKeys.renderMode, '3d')
      return
    }
    setRenderMode('2d')
    setModeNotice('已手动切换为 2D 服务列表。')
    setStoredValue(preferenceKeys.renderMode, '2d')
  }

  const fallbackTo2d = useCallback((reason) => {
    setRenderMode('2d')
    setModeNotice(reason)
    setStoredValue(preferenceKeys.renderMode, '2d')
  }, [])

  const recordVisit = (slug) => {
    setRecent(addRecentService(preferenceKeys.recent, slug))
  }

  const closeHelp = () => {
    setHelpOpen(false)
    setStoredValue(preferenceKeys.introSeen, 'true')
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#service-directory">
        跳到可访问服务目录
      </a>

      <header className={`command-bar ${mobileSearchOpen ? 'is-search-open' : ''}`}>
        <div className="brand-context">
          <button type="button" className="brand" onClick={goHome} aria-label="返回导航首页">
            <picture className="brand__mark">
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
            <span className="brand__copy">
              <strong>E时代社团服务导航</strong>
              <small>科技创新，连接未来</small>
            </span>
          </button>
          <BreadcrumbTrail
            category={selectedCategory}
            service={selectedService}
            onHome={goHome}
            onCategory={focusCategory}
            className="breadcrumbs--desktop"
          />
        </div>

        <button
          type="button"
          className="mobile-search-trigger"
          onClick={() => {
            const nextOpen = !mobileSearchOpen
            setMobileSearchOpen(nextOpen)
            if (nextOpen) {
              window.requestAnimationFrame(() => searchRef.current?.focus())
            } else {
              setQuery('')
              searchRef.current?.blur()
            }
          }}
          aria-label={mobileSearchOpen ? '关闭搜索' : '打开搜索'}
          aria-expanded={mobileSearchOpen}
          aria-controls="global-search"
        >
          {mobileSearchOpen ? <X aria-hidden="true" /> : <Search aria-hidden="true" />}
        </button>

        <div className={`command-center ${mobileSearchOpen ? 'is-mobile-open' : ''}`}>
        <div className="search-console" id="global-search">
          <Search aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveSearchIndex(0)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' && searchResults.length) {
                event.preventDefault()
                setActiveSearchIndex((index) => (index + 1) % searchResults.length)
              }
              if (event.key === 'ArrowUp' && searchResults.length) {
                event.preventDefault()
                setActiveSearchIndex(
                  (index) => (index - 1 + searchResults.length) % searchResults.length,
                )
              }
              if (event.key === 'Enter' && searchResults[activeSearchIndex]) {
                event.preventDefault()
                focusService(searchResults[activeSearchIndex].slug)
              }
              if (event.key === 'Escape') {
                setQuery('')
                setMobileSearchOpen(false)
                event.currentTarget.blur()
              }
            }}
            placeholder={`搜索 ${services.length} 个服务…`}
            aria-label="搜索服务"
            role="combobox"
            aria-expanded={searchResults.length > 0}
            aria-controls="search-results"
            aria-autocomplete="list"
            aria-activedescendant={
              searchResults[activeSearchIndex]
                ? `search-${searchResults[activeSearchIndex].slug}`
                : undefined
            }
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="清除搜索">
              <X aria-hidden="true" />
            </button>
          )}
          {!query && (
            <kbd className="search-shortcut" aria-hidden="true">
              ⌘K
            </kbd>
          )}
          {searchResults.length > 0 && (
            <div className="search-results" id="search-results" role="listbox">
              {searchResults.map((service, index) => (
                <button
                  id={`search-${service.slug}`}
                  key={service.slug}
                  type="button"
                  role="option"
                  aria-selected={index === activeSearchIndex}
                  className={index === activeSearchIndex ? 'is-active' : ''}
                  onMouseEnter={() => setActiveSearchIndex(index)}
                  onClick={() => focusService(service.slug)}
                >
                  <ServiceCardFace service={service} variant="search" showArrow={false} />
                </button>
              ))}
            </div>
          )}
          {query && searchResults.length === 0 && (
            <div className="search-results search-empty" role="status">
              没有匹配的服务
            </div>
          )}
        </div>
        </div>

        <div className="command-actions">
          <a className="site-switch" href="/oj" aria-label="切换到刷题导航副站">
            <Terminal aria-hidden="true" />
            <span>刷题导航</span>
          </a>
          <button
            type="button"
            className="mode-switch"
            onClick={switchRenderMode}
            aria-label={`切换到${renderMode === '3d' ? '2D' : '3D'}模式`}
          >
            {renderMode === '3d' ? <Box aria-hidden="true" /> : <Monitor aria-hidden="true" />}
            <span>{renderMode === '3d' ? '3D 图标' : '2D 列表'}</span>
          </button>
          <button
            ref={themeButtonRef}
            type="button"
            className="icon-button theme-button"
            onClick={toggleTheme}
            aria-label={`切换到${theme === 'dark' ? '浅色' : '深色'}主题`}
          >
            <span className="theme-button__glyph" key={theme}>
              {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </span>
          </button>
          <button
            ref={helpTriggerRef}
            type="button"
            className="icon-button help-button"
            onClick={openHelp}
            aria-label="导航操作帮助"
          >
            <CircleHelp aria-hidden="true" />
          </button>
        </div>
      </header>
      <BreadcrumbTrail
        category={selectedCategory}
        service={selectedService}
        onHome={goHome}
        onCategory={focusCategory}
        className="breadcrumbs--mobile"
      />

      {!online && (
        <div className="system-banner" role="status">
          <WifiOff aria-hidden="true" />
          当前离线。仍可浏览目录，但暂时无法打开外部服务。
        </div>
      )}
      {modeNotice && (
        <div className="system-banner system-banner--neutral" role="status">
          {modeNotice}
        </div>
      )}

      <main>
        <section className={`spatial-stage spatial-stage--${renderMode}`} aria-labelledby="hero-title">
          {renderMode === '3d' ? (
            <SceneErrorBoundary
              onError={() => fallbackTo2d('3D 图标场景加载失败，已切换到 2D 服务列表。')}
              fallback={null}
            >
              <Suspense
                fallback={
                  <div className="scene-loading" role="status">
                    <span />
                    正在生成 3D 图标实体…
                  </div>
                }
              >
              <SpatialScene
                spatialState={spatialState}
                hoveredService={hoveredService}
                onCategory={focusCategory}
                onService={focusService}
                onFallback={fallbackTo2d}
                  theme={theme}
                  reducedMotion={reducedMotion}
                  cameraRevision={cameraRevision}
                  paused={modalOpen}
                  performanceProfile={capabilities}
                />
              </Suspense>
            </SceneErrorBoundary>
          ) : (
            <div className="two-d-backdrop" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}

          <Motion.div
            className="hero-copy"
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.38, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <picture className="hero-brand-mark">
              <source
                type="image/webp"
                srcSet="/brand/e-era-logo-192.webp 1x, /brand/e-era-logo-512.webp 2x"
              />
              <img
                src="/brand/e-era-logo-192.png"
                srcSet="/brand/e-era-logo-192.png 1x, /brand/e-era-logo-512.png 2x"
                width="72"
                height="72"
                alt="E时代协会品牌标识"
              />
            </picture>
            <p className="eyebrow">科技创新，连接未来</p>
            <h1 id="hero-title">
              <WaveText text="E时代社团" />
              <WaveText text="服务导航" />
            </h1>
            <RevealLines
              lines={[
                '快速访问社团开发、通行证与团队服务。',
                '从算法实验室到云端服务，一站式连接社团数字资产。',
                '切换 3D 空间模式，用图标墙探索全部入口。',
              ]}
            />
            <FadeInUp className="hero-stats" delay={0.15} aria-label="站点概览">
              <div>
                <strong>{services.length}</strong>
                <span>服务入口</span>
              </div>
              <div>
                <strong>{categories.length}</strong>
                <span>服务分类</span>
              </div>
              <div>
                <strong>{recent.length}</strong>
                <span>最近访问</span>
              </div>
            </FadeInUp>
          </Motion.div>

          {renderMode === '3d' && (
            <div className="gesture-hint" aria-hidden="true">
              <span>拖拽查看空间</span>
              <span>滚轮缩放</span>
              <span>点击图标查看详情</span>
            </div>
          )}
          <a className="directory-jump" href="#service-directory">
            浏览服务列表
          </a>
        </section>

        <FadeInUp
          as="nav"
          className="region-legend"
          aria-label="服务分类"
          delay={0.05}
        >
          {categories.map((category, index) => (
            <button
              type="button"
              key={category.slug}
              className={spatialState.category === category.slug ? 'is-active' : ''}
              onClick={() => focusCategory(category.slug)}
              style={{ '--legend-accent': category.accent }}
            >
              <span className="region-legend__index">0{index + 1}</span>
              <CategoryGlyph id={category.slug} className="region-legend__icon" />
              <strong>{category.name}</strong>
              <small>{category.description}</small>
              <em className="region-legend__count">
                {servicesByCategory[category.slug].length}
              </em>
            </button>
          ))}
        </FadeInUp>

        <Directory
          spatialState={spatialState}
          recent={recent}
          direct={renderMode === '2d'}
          reducedMotion={reducedMotion}
          onCategory={focusCategory}
          onService={focusService}
          onDirectVisit={recordVisit}
          onHover={setHoveredService}
        />

        <FadeInUp as="section" className="nav-tips" aria-labelledby="nav-tips-title" delay={0.05}>
          <div className="nav-tips__intro">
            <p className="eyebrow">使用贴士</p>
            <h2 id="nav-tips-title">更快找到你需要的服务</h2>
          </div>
          <div className="nav-tips__grid">
            <article className="nav-tip">
              <Search aria-hidden="true" />
              <strong>随时搜索</strong>
              <p>按 ⌘K / Ctrl K 唤起搜索框，输入名称即可直达服务。</p>
            </article>
            <article className="nav-tip">
              <Layers aria-hidden="true" />
              <strong>按类浏览</strong>
              <p>按 Alt 1–4 聚焦成员项目、产品服务、通行证生态与团队官网。</p>
            </article>
            <article className="nav-tip">
              <Terminal aria-hidden="true" />
              <strong>刷题导航</strong>
              <p>前往独立副站，集中管理你的刷题与竞赛平台。</p>
            </article>
          </div>
          <a className="nav-tips__cta" href="/oj" rel="noopener noreferrer">
            打开刷题导航
            <ChevronRight aria-hidden="true" />
          </a>
        </FadeInUp>
      </main>

      <footer className="site-footer">
        <div>
          <strong>E时代</strong>
          <span>科技创新，连接未来</span>
        </div>
        <nav aria-label="站点相关链接">
          <a href="https://we.emoera.com/" target="_blank" rel="noopener noreferrer">
            关于我们
          </a>
          <a href="https://www.qifalab.cn/" target="_blank" rel="noopener noreferrer">
            技术支持
          </a>
          <a
            href="https://docs.qq.com/aio/DVHZpRFFTdUVIYlV2?p=BvAba1pUjsuoDHKNY65azz"
            target="_blank"
            rel="noopener noreferrer"
          >
            更新日志
          </a>
          <a
            href="https://www.qifalab.cn/qifalab-v1/contact.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            意见反馈
          </a>
        </nav>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          蜀ICP备2024055741号
        </a>
        <span>© {new Date().getFullYear()} E时代科技</span>
      </footer>

      <Modal
        open={Boolean(selectedService && !helpOpen)}
        title={selectedService?.name || ''}
        eyebrow={selectedCategory?.name}
        onClose={closeService}
        className="service-modal"
      >
        {selectedService && (
          <>
            <div className="service-detail">
              <ServiceCardFace
                service={selectedService}
                variant="detail"
                showArrow={false}
              />
              <dl>
                <div>
                  <dt>所属区域</dt>
                  <dd>{selectedCategory.name}</dd>
                </div>
                <div>
                  <dt>目标域名</dt>
                  <dd>{new URL(selectedService.url).hostname}</dd>
                </div>
              </dl>
            </div>
            <div className="modal__actions">
              {online && isSafeExternalUrl(selectedService.url) ? (
                <a
                  className="primary-action"
                  href={selectedService.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-service-launch={selectedService.slug}
                  onClick={() => {
                    recordVisit(selectedService.slug)
                    closeService()
                  }}
                >
                  访问服务
                  <ChevronRight aria-hidden="true" />
                </a>
              ) : (
                <button type="button" className="primary-action" disabled>
                  访问服务
                  <ChevronRight aria-hidden="true" />
                </button>
              )}
            </div>
          </>
        )}
      </Modal>

      <Modal open={helpOpen} title="如何使用服务导航" eyebrow="操作说明与快捷键" onClose={closeHelp}>
        <div className="help-grid">
          <div>
            <span>01</span>
            <strong>按分类浏览</strong>
            <p>按成员项目、产品服务、通行证生态链、团队与官网查看社团入口。</p>
          </div>
          <div>
            <span>02</span>
            <strong>搜索服务</strong>
            <p>输入服务名称或说明，直接找到对应的社团服务卡片。</p>
          </div>
          <div>
            <span>03</span>
            <strong>打开服务</strong>
            <p>查看服务详情后，一次点击即可在新标签页打开原始地址。</p>
          </div>
        </div>
        <dl className="shortcut-list">
          <div>
            <dt>⌘/Ctrl K</dt>
            <dd>搜索</dd>
          </div>
          <div>
            <dt>Alt H</dt>
            <dd>回到总览</dd>
          </div>
          <div>
            <dt>Alt B</dt>
            <dd>返回上一级</dd>
          </div>
          <div>
            <dt>Alt 1–4</dt>
            <dd>聚焦区域</dd>
          </div>
          <div>
            <dt>Alt ?</dt>
            <dd>帮助</dd>
          </div>
        </dl>
        <button type="button" className="primary-action help-confirm" onClick={closeHelp}>
          开始使用
        </button>
      </Modal>
    </div>
  )
}

export default App
