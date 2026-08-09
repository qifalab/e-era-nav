import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import {
  Box,
  ChevronRight,
  CircleHelp,
  Compass,
  Monitor,
  Moon,
  Network,
  Search,
  Sun,
  WifiOff,
  X,
} from 'lucide-react'
import './SpatialApp.css'
import Directory from './components/Directory'
import Modal from './components/Modal'
import SceneErrorBoundary from './components/SceneErrorBoundary'
import ServiceCardFace from './components/ServiceCardFace'
import {
  ojCategories,
  ojResourceCount,
  ojServiceBySlug,
  ojServicesByCategory,
} from './data/ojResources'
import { categories, categoryBySlug, serviceBySlug, services } from './data/services'
import { detectCapabilities } from './lib/capabilities'
import {
  buildLocation,
  createSpatialState,
  getCategoryBySlug,
  isSafeExternalUrl,
  NAMESPACES,
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
  const initialState = useMemo(() => parseLocation(window.location.search), [])
  const [spatialState, setSpatialState] = useState(() => initialState)
  const [theme, setTheme] = useState(() => {
    const stored = getStoredValue(preferenceKeys.theme)
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const isOjMode = spatialState.namespace === NAMESPACES.OJ
  const [renderMode, setRenderMode] = useState(() => {
    if (initialState.namespace === NAMESPACES.OJ) return '2d'
    const stored = getStoredValue(preferenceKeys.renderMode)
    if (stored === '2d') return '2d'
    if (stored === '3d' && capabilities.recommendedMode === '3d') return '3d'
    if (compactViewport) return '2d'
    return capabilities.recommendedMode
  })
  const [modeNotice, setModeNotice] = useState(() =>
    initialState.namespace === NAMESPACES.OJ
      ? '副导航 OJ 刷题资源始终使用 2D 列表呈现。'
      : capabilities.recommendedMode === '2d'
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
  const searchRef = useRef(null)
  const helpTriggerRef = useRef(null)
  const themeButtonRef = useRef(null)
  const helpWasOpenedRef = useRef(false)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Per-namespace lookup tables so the rest of the App stays schema-agnostic.
  const activeServiceBySlug = isOjMode ? ojServiceBySlug : serviceBySlug
  const activeCategoryBySlug = isOjMode
    ? getCategoryBySlug(NAMESPACES.OJ)
    : categoryBySlug
  const activeServices = isOjMode
    ? ojCategories.flatMap((category) => ojServicesByCategory[category.slug])
    : services
  const activeCategories = isOjMode ? ojCategories : categories

  const selectedService = activeServiceBySlug[spatialState.service] || null
  const selectedCategory = activeCategoryBySlug[spatialState.category] || null
  const modalOpen = Boolean(selectedService || helpOpen)
  const openHelp = useCallback(() => {
    helpWasOpenedRef.current = true
    setHelpOpen(true)
  }, [])

  const searchResults = useMemo(() => {
    const needle = normalize(query)
    if (!needle) return []
    return activeServices
      .filter((service) => {
        const category = activeCategoryBySlug[service.category]
        return normalize(
          `${service.name}${service.description}${category ? category.name : ''}`,
        ).includes(needle)
      })
      .slice(0, 7)
  }, [query, activeServices, activeCategoryBySlug])

  const navigateSpatial = useCallback((nextState, replace = false) => {
    const safeState = createSpatialState(
      nextState?.category,
      nextState?.service,
      nextState?.namespace ?? spatialState.namespace,
    )
    const currentState = parseLocation(window.location.search)
    if (
      currentState.namespace === safeState.namespace &&
      currentState.category === safeState.category &&
      currentState.service === safeState.service
    ) {
      setSpatialState(safeState)
      return
    }
    const method = replace ? 'replaceState' : 'pushState'
    window.history[method]({ eraSpatial: safeState }, '', buildLocation(safeState))
    setSpatialState(safeState)
  }, [spatialState.namespace])

  const focusCategory = useCallback(
    (slug) => {
      navigateSpatial(
        createSpatialState(slug, null, spatialState.namespace),
      )
      if (isOjMode || renderMode === '2d') {
        window.requestAnimationFrame(() => {
          document
            .getElementById(`region-${slug}`)
            ?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' })
        })
      }
    },
    [navigateSpatial, reducedMotion, renderMode, isOjMode, spatialState.namespace],
  )

  const focusService = useCallback(
    (slug) => {
      const service = activeServiceBySlug[slug]
      if (!service) return
      setQuery('')
      setMobileSearchOpen(false)
      navigateSpatial(
        createSpatialState(service.category, service.slug, spatialState.namespace),
      )
    },
    [activeServiceBySlug, navigateSpatial, spatialState.namespace],
  )

  const goHome = useCallback(
    () => {
      setCameraRevision((revision) => revision + 1)
      navigateSpatial(createSpatialState(null, null, spatialState.namespace))
    },
    [navigateSpatial, spatialState.namespace],
  )

  const switchNamespace = useCallback(
    (nextNamespace) => {
      const target = nextNamespace === NAMESPACES.OJ ? NAMESPACES.OJ : NAMESPACES.MAIN
      const targetState = createSpatialState(null, null, target)
      setSpatialState(targetState)
      setQuery('')
      setMobileSearchOpen(false)
      setHelpOpen(false)
      if (target === NAMESPACES.OJ) {
        setModeNotice('已切换到 OJ 副导航，仅展示 2D 资源列表。')
      } else {
        setModeNotice('已返回 E时代社团服务导航。')
      }
      window.history.pushState({ eraSpatial: targetState }, '', buildLocation(targetState))
    },
    [],
  )

  const toggleNamespace = useCallback(() => {
    switchNamespace(isOjMode ? NAMESPACES.MAIN : NAMESPACES.OJ)
  }, [isOjMode, switchNamespace])

  const toggleThemeRipple = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    const button = themeButtonRef.current
    const root = document.documentElement

    if (typeof document.startViewTransition !== 'function' || !button) {
      setTheme(nextTheme)
      return
    }

    const rect = button.getBoundingClientRect()
    const originX = rect.left + rect.width / 2
    const originY = rect.top + rect.height / 2
    const maxRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY),
    )

    root.style.setProperty('--theme-origin-x', `${originX}px`)
    root.style.setProperty('--theme-origin-y', `${originY}px`)
    root.style.setProperty('--theme-origin-r', `${maxRadius}px`)

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme)
    })

    transition.finished
      .catch(() => {
        // 状态已经被 startViewTransition 内的回调切换，无需手动回退。
      })
      .finally(() => {
        root.style.removeProperty('--theme-origin-x')
        root.style.removeProperty('--theme-origin-y')
        root.style.removeProperty('--theme-origin-r')
      })
  }, [theme])

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
      } else if (event.altKey && event.key.toLowerCase() === 'o') {
        toggleNamespace()
      } else if (
        event.altKey &&
        ['1', '2', '3', '4'].includes(event.key) &&
        !isOjMode &&
        activeCategories[Number(event.key) - 1]
      ) {
        focusCategory(activeCategories[Number(event.key) - 1].slug)
      } else if (
        event.altKey &&
        ['1', '2', '3', '4', '5'].includes(event.key) &&
        isOjMode &&
        activeCategories[Number(event.key) - 1]
      ) {
        focusCategory(activeCategories[Number(event.key) - 1].slug)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [
    activeCategories,
    compactViewport,
    focusCategory,
    goBack,
    goHome,
    isOjMode,
    modalOpen,
    openHelp,
    toggleNamespace,
  ])

  const switchRenderMode = () => {
    if (isOjMode) return
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
    <div className={`app-shell ${isOjMode ? 'app-shell--oj' : ''}`}>
      <a className="skip-link" href="#service-directory">
        跳到可访问服务目录
      </a>

      <header
        className={`command-bar ${mobileSearchOpen ? 'is-search-open' : ''} ${
          isOjMode ? 'command-bar--oj' : ''
        }`}
      >
        <div className="brand-context">
          <button
            type="button"
            className="brand"
            onClick={goHome}
            aria-label={isOjMode ? '返回 OJ 导航首页' : '返回导航首页'}
          >
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
            <strong>
              {isOjMode ? 'E时代 OJ 刷题导航' : 'E时代社团服务导航'}
            </strong>
            <small>{isOjMode ? 'XCPC · 算法 · 软件开发' : '科技创新，连接未来'}</small>
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
            placeholder={
              isOjMode
                ? `搜索 ${ojResourceCount} 个 OJ / 刷题资源…`
                : `搜索 ${services.length} 个服务…`
            }
            aria-label={isOjMode ? '搜索 OJ 资源' : '搜索服务'}
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
              {isOjMode ? '没有匹配的资源' : '没有匹配的服务'}
            </div>
          )}
        </div>
        </div>

        <div className="command-actions">
          <button
            type="button"
            className={`mode-switch ${isOjMode ? 'is-oj' : ''}`}
            onClick={toggleNamespace}
            aria-label={
              isOjMode
                ? '切换到主导航：E时代社团服务'
                : '切换到副导航：OJ 刷题资源'
            }
            data-namespace={isOjMode ? 'main' : 'oj'}
          >
            {isOjMode ? <Network aria-hidden="true" /> : <Compass aria-hidden="true" />}
            <span>{isOjMode ? '主导航' : 'OJ 刷题'}</span>
          </button>
          <button
            type="button"
            className="mode-switch"
            onClick={switchRenderMode}
            disabled={isOjMode}
            aria-label={
              isOjMode
                ? '副导航固定为 2D 列表'
                : `切换到${renderMode === '3d' ? '2D' : '3D'}模式`
            }
          >
            {renderMode === '3d' ? <Box aria-hidden="true" /> : <Monitor aria-hidden="true" />}
            <span>
              {isOjMode
                ? '2D 列表'
                : renderMode === '3d'
                  ? '3D 图标'
                  : '2D 列表'}
            </span>
          </button>
          <button
            ref={themeButtonRef}
            type="button"
            className="icon-button theme-button"
            onClick={toggleThemeRipple}
            aria-label={`切换到${theme === 'dark' ? '浅色' : '深色'}主题`}
          >
            {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
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
        {isOjMode ? (
          <section className="oj-hero" aria-labelledby="oj-hero-title">
            <div className="oj-hero__backdrop" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <Motion.div
              className="oj-hero__copy"
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.38, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <p className="eyebrow">XCPC 竞赛 · 你应该了解的在线资源</p>
              <h1 id="oj-hero-title">
                <span>E时代 OJ</span>
                <span>刷题资源导航</span>
              </h1>
              <p>
                收录算法竞赛刷题站、基础学习教程、XCPC 资源拓展与软件开发站点，
                全部按分类整理，方便随时取用。
              </p>
            </Motion.div>
            {/* 移到 .oj-hero__copy 之外，使绝对定位相对整个 hero 容器；同时挪到右下角避开 h1（OJ hero 高度紧凑） */}
            <a className="directory-jump" href="#service-directory">
              直接浏览资源列表
            </a>
          </section>
        ) : (
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
                <span>E时代社团</span>
                <span>服务导航</span>
              </h1>
              <p>快速访问社团开发、通行证与团队服务。</p>
            </Motion.div>

            <nav className="region-legend" aria-label="服务分类">
              {categories.map((category, index) => (
                <button
                  type="button"
                  key={category.slug}
                  className={spatialState.category === category.slug ? 'is-active' : ''}
                  onClick={() => focusCategory(category.slug)}
                  style={{ '--legend-accent': category.accent }}
                >
                  <span>0{index + 1}</span>
                  <strong>{category.name}</strong>
                  <small>{category.description}</small>
                </button>
              ))}
            </nav>

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
        )}

        <Directory
          namespace={isOjMode ? 'oj' : 'main'}
          namespaceLabel={isOjMode ? 'OJ 副导航' : undefined}
          introEyebrow={
            isOjMode ? `${ojResourceCount} 个 XCPC / 刷题 / 软件开发资源` : undefined
          }
          introTitle={isOjMode ? '按分类挑选最趁手的刷题资源' : undefined}
          introDescription={
            isOjMode
              ? '信息门户、基础学习、刷题训练、竞赛资源、软件工具——按当前目标挑选。'
              : undefined
          }
          categories={isOjMode ? ojCategories : undefined}
          services={
            isOjMode
              ? ojCategories.flatMap((category) => ojServicesByCategory[category.slug])
              : undefined
          }
          serviceBySlug={isOjMode ? ojServiceBySlug : undefined}
          servicesByCategory={isOjMode ? ojServicesByCategory : undefined}
          spatialState={spatialState}
          recent={recent}
          direct={isOjMode || renderMode === '2d'}
          onCategory={focusCategory}
          onService={focusService}
          onDirectVisit={recordVisit}
        />
      </main>

      <footer className="site-footer">
        <div>
          <strong>E时代</strong>
          <span>科技创新，连接未来</span>
        </div>
        <nav aria-label="站点相关链接">
          <a href="https://we.emoera.com/" target="_blank" rel="noopener noreferrer nofollow">
            关于我们
          </a>
          <a href="https://www.qifalab.cn/" target="_blank" rel="noopener noreferrer nofollow">
            技术支持
          </a>
          <a
            href="https://docs.qq.com/aio/DVHZpRFFTdUVIYlV2?p=BvAba1pUjsuoDHKNY65azz"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            更新日志
          </a>
          <a
            href="https://www.qifalab.cn/qifalab-v1/contact.html"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            意见反馈
          </a>
        </nav>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer nofollow">
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
              {online && isSafeExternalUrl(selectedService.url, spatialState.namespace) ? (
                <a
                  className="primary-action"
                  href={selectedService.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
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
            <p>
              {isOjMode
                ? '按信息门户、基础学习、刷题训练、竞赛资源、软件工具查看 XCPC 站群。'
                : '按成员项目、产品服务、通行证生态链、团队与官网查看社团入口。'}
            </p>
          </div>
          <div>
            <span>02</span>
            <strong>搜索资源</strong>
            <p>
              {isOjMode
                ? '输入刷题站名称或简介，直接跳到对应的 OJ 资源。'
                : '输入服务名称或说明，直接找到对应的社团服务卡片。'}
            </p>
          </div>
          <div>
            <span>03</span>
            <strong>切换主/副导航</strong>
            <p>右上角胶囊可一键在 E时代服务导航与 OJ 刷题导航间切换。</p>
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
            <dt>Alt O</dt>
            <dd>切换主/副导航</dd>
          </div>
          <div>
            <dt>Alt 1–{isOjMode ? '5' : '4'}</dt>
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
