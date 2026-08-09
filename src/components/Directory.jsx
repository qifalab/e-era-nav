import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Clock3, SearchX } from 'lucide-react'
import {
  categories,
  onboardingSteps,
  serviceBySlug,
  services,
  servicesByCategory,
} from '../data/services'
import { isSafeExternalUrl } from '../lib/navigation'
import ServiceCardFace from './ServiceCardFace'

function ServiceCard({
  service,
  recent,
  selected,
  direct,
  reducedMotion,
  onSelect,
  onDirectVisit,
  onHover,
}) {
  const content = (
    <>
      <ServiceCardFace service={service} showArrow={false} showTags showBadge />
      <span className="service-card__foot">
        <span className="service-card__meta">
          {recent && (
            <span className="service-card__recent">
              <Clock3 aria-hidden="true" />
              最近访问
            </span>
          )}
        </span>
        <span className="service-card__action">
          {direct ? '前往' : '查看详情'}
          <ArrowUpRight aria-hidden="true" />
        </span>
      </span>
    </>
  )

  const motionProps = reducedMotion
    ? {}
    : {
        layout: true,
        initial: { opacity: 0, y: 14, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.16 } },
        transition: { type: 'spring', stiffness: 300, damping: 25, mass: 0.7 },
        whileHover: { y: -5, scale: 1.012 },
        whileTap: { scale: 0.985 },
      }

  return (
    <motion.article
      className={`service-card ${selected ? 'is-selected' : ''} ${
        recent ? 'has-recent' : ''
      }`}
      data-testid="service-card"
      data-service={service.slug}
      onMouseEnter={() => onHover?.(service.slug)}
      onMouseLeave={() => onHover?.(null)}
      {...motionProps}
    >
      {direct && isSafeExternalUrl(service.url) ? (
        <a
          className="service-card__main"
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          data-direct-service={service.slug}
          onClick={() => onDirectVisit(service.slug)}
          onAuxClick={() => onDirectVisit(service.slug)}
          aria-label={`打开 ${service.name}`}
        >
          {content}
        </a>
      ) : (
        <button
          type="button"
          className="service-card__main"
          onClick={() => onSelect(service.slug)}
          aria-label={`查看 ${service.name} 详情`}
        >
          {content}
        </button>
      )}
    </motion.article>
  )
}

export default function Directory({
  spatialState,
  recent,
  direct = false,
  reducedMotion = false,
  onCategory,
  onService,
  onDirectVisit,
  onHover,
}) {
  const activeCategory = spatialState.category
  const visibleCategories = activeCategory
    ? categories.filter((category) => category.slug === activeCategory)
    : categories

  return (
    <section className="directory" id="service-directory" aria-labelledby="directory-title">
      <div className="directory__intro">
        <p className="eyebrow">{services.length} 个社团服务入口</p>
        <h2 id="directory-title">选择服务，快速访问</h2>
        <p>按成员项目、产品服务、通行证生态链、团队与官网分类浏览。</p>
      </div>

      {activeCategory && (
        <div className="directory__filter-bar" role="status">
          <span>
            已筛选「{categories.find((c) => c.slug === activeCategory)?.name}」·{' '}
            {servicesByCategory[activeCategory].length} 个入口
          </span>
          <button type="button" onClick={() => onCategory(null)}>
            显示全部服务
          </button>
        </div>
      )}

      <motion.div className="directory__regions" layout={!reducedMotion}>
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleCategories.map((category) => (
            <motion.section
              layout={!reducedMotion}
              key={category.slug}
              className={`directory-region ${
                spatialState.category === category.slug ? 'is-active' : ''
              }`}
              id={`region-${category.slug}`}
              style={{ '--region-accent': category.accent }}
              aria-labelledby={`region-title-${category.slug}`}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8, transition: { duration: 0.16 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <button
                type="button"
                className="directory-region__heading"
                onClick={() => onCategory(category.slug)}
                aria-label={`聚焦${category.name}`}
              >
                <span className="region-index">0{categories.indexOf(category) + 1}</span>
                <span>
                  <strong id={`region-title-${category.slug}`}>{category.name}</strong>
                  <small>{category.description}</small>
                </span>
                <span>{servicesByCategory[category.slug].length} 个入口</span>
              </button>

              <div className="service-grid">
                <AnimatePresence mode="popLayout" initial={false}>
                  {servicesByCategory[category.slug].map((service) => (
                    <ServiceCard
                      key={service.slug}
                      service={service}
                      recent={recent.includes(service.slug)}
                      selected={spatialState.service === service.slug}
                      direct={direct}
                      reducedMotion={reducedMotion}
                      onSelect={onService}
                      onDirectVisit={onDirectVisit}
                      onHover={onHover}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </motion.div>

      {visibleCategories.length === 0 && (
        <div className="directory__empty" role="status">
          <SearchX aria-hidden="true" />
          <p>该分类下暂无服务</p>
          <button type="button" onClick={() => onCategory(null)}>
            返回全部服务
          </button>
        </div>
      )}

      <section className="onboarding" aria-labelledby="onboarding-title">
        <div className="onboarding__intro">
          <p className="eyebrow">新成员指引</p>
          <h2 id="onboarding-title">第一次来？三步接入社团</h2>
        </div>
        <ol className="onboarding__steps">
          {onboardingSteps.map((item) => {
            const target = serviceBySlug[item.slug]
            return (
              <li key={item.step}>
                <span className="onboarding__index" aria-hidden="true">
                  {item.step}
                </span>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                {target && (
                  <button type="button" onClick={() => onService(item.slug)}>
                    前往 {target.name}
                    <ArrowUpRight aria-hidden="true" />
                  </button>
                )}
              </li>
            )
          })}
        </ol>
      </section>

      {recent.length > 0 && (
        <aside className="personal-index" aria-label="个人快捷入口">
          <div>
            <span>最近访问</span>
            {recent.map((slug) =>
              serviceBySlug[slug] ? (
                <button key={slug} type="button" onClick={() => onService(slug)}>
                  {serviceBySlug[slug].name}
                </button>
              ) : null,
            )}
          </div>
        </aside>
      )}
    </section>
  )
}
