import { useEffect, useMemo, useRef, useState } from 'react'
import { CornerDownLeft, Search, X } from 'lucide-react'
import { categories, categoryBySlug, serviceBySlug, services } from '../data/services'
import ServiceCardFace from './ServiceCardFace'

function normalize(value) {
  return value.toLocaleLowerCase('zh-CN').replace(/\s+/g, '')
}

function matches(service, needle) {
  const haystack = normalize(
    `${service.name}${service.description}${categoryBySlug[service.category].name}${(
      service.tags || []
    ).join('')}`,
  )
  return haystack.includes(needle)
}

export default function Spotlight({ open, recent = [], onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const listRef = useRef(null)
  const returnFocusRef = useRef(null)

  const groups = useMemo(() => {
    const needle = normalize(query)
    if (!needle) {
      const recentServices = recent
        .map((slug) => serviceBySlug[slug])
        .filter(Boolean)
        .slice(0, 4)
      const result = []
      if (recentServices.length) {
        result.push({ id: 'recent', label: '最近访问', items: recentServices })
      }
      categories.forEach((category) => {
        const items = services.filter((service) => service.category === category.slug)
        if (items.length) {
          result.push({ id: category.slug, label: category.name, accent: category.accent, items })
        }
      })
      return result
    }

    return categories
      .map((category) => ({
        id: category.slug,
        label: category.name,
        accent: category.accent,
        items: services.filter(
          (service) => service.category === category.slug && matches(service, needle),
        ),
      }))
      .filter((group) => group.items.length > 0)
  }, [query, recent])

  const flatItems = useMemo(
    () => groups.flatMap((group) => group.items.map((item) => ({ group: group.id, item }))),
    [groups],
  )

  const activeOption = flatItems[activeIndex]

  useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  useEffect(() => {
    if (!open) return
    const node = listRef.current?.querySelector('[data-active="true"]')
    node?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  if (!open) return null

  const dismiss = (restoreFocus = true) => {
    setQuery('')
    setActiveIndex(0)
    const returnFocus = returnFocusRef.current
    returnFocusRef.current = null
    if (restoreFocus && returnFocus?.isConnected) {
      window.requestAnimationFrame(() => returnFocus.focus())
    }
    onClose()
  }

  const commit = (index) => {
    const entry = flatItems[index]
    if (!entry) return
    dismiss(false)
    onSelect(entry.item.slug)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' && flatItems.length) {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % flatItems.length)
    } else if (event.key === 'ArrowUp' && flatItems.length) {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + flatItems.length) % flatItems.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      commit(activeIndex)
    }
  }

  const handleDialogKeyDown = (event) => {
    if (
      event.key.toLowerCase() === 'k' &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault()
      event.stopPropagation()
      dismiss()
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      dismiss()
      return
    }
    if (event.key !== 'Tab') return

    const focusable = Array.from(
      panelRef.current?.querySelectorAll('input:not([disabled]), button:not([disabled])') || [],
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  let cursor = -1

  return (
    <div
      className="spotlight"
      role="dialog"
      aria-modal="true"
      aria-label="服务命令面板"
      onKeyDown={handleDialogKeyDown}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss()
      }}
    >
      <div className="spotlight__panel" ref={panelRef}>
        <div className="spotlight__field">
          <Search aria-hidden="true" />
          <input
            ref={inputRef}
            autoFocus
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder={`搜索 ${services.length} 个服务、标签或分类…`}
            aria-label="搜索服务"
            role="combobox"
            aria-expanded={flatItems.length > 0}
            aria-controls="spotlight-results"
            aria-autocomplete="list"
            aria-activedescendant={
              activeOption
                ? `spotlight-${activeOption.group}-${activeOption.item.slug}`
                : undefined
            }
          />
          {query && (
            <button type="button" onClick={() => {
                setQuery('')
                setActiveIndex(0)
              }} aria-label="清除搜索">
              <X aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="spotlight__close"
            onClick={dismiss}
            aria-label="关闭命令面板"
          >
            Esc
          </button>
        </div>

        <div className="spotlight__results" id="spotlight-results" role="listbox" ref={listRef}>
          {flatItems.length === 0 ? (
            <div className="spotlight__empty" role="status">
              <strong>没有匹配的服务</strong>
              <span>试试搜索标签，例如「账号」「云端开发」「算法」</span>
            </div>
          ) : (
            groups.map((group) => (
              <div className="spotlight__group" key={group.id}>
                <p className="spotlight__group-label" style={{ '--group-accent': group.accent }}>
                  {group.label}
                  <em>{group.items.length}</em>
                </p>
                {group.items.map((service) => {
                  cursor += 1
                  const index = cursor
                  const isActive = index === activeIndex
                  return (
                    <button
                      key={`${group.id}-${service.slug}`}
                      id={`spotlight-${group.id}-${service.slug}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      data-active={isActive}
                      className={`spotlight__item ${isActive ? 'is-active' : ''}`}
                      onMouseMove={() => setActiveIndex(index)}
                      onClick={() => commit(index)}
                    >
                      <ServiceCardFace service={service} variant="search" showArrow={false} showBadge />
                      {isActive && (
                        <span className="spotlight__enter" aria-hidden="true">
                          <CornerDownLeft />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <footer className="spotlight__foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> 选择
          </span>
          <span>
            <kbd>Enter</kbd> 打开
          </span>
          <span>
            <kbd>Esc</kbd> 关闭
          </span>
        </footer>
      </div>
    </div>
  )
}
