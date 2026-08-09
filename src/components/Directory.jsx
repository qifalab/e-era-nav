import { Clock3 } from 'lucide-react'
import {
  categories,
  serviceBySlug,
  services,
  servicesByCategory,
} from '../data/services'
import { isSafeExternalUrl } from '../lib/navigation'
import ServiceCardFace from './ServiceCardFace'

function ServiceCard({
  service,
  namespace,
  recent,
  selected,
  direct,
  onSelect,
  onDirectVisit,
}) {
  const content = <ServiceCardFace service={service} />
  return (
    <article
      className={`service-card ${selected ? 'is-selected' : ''} ${
        recent ? 'has-recent' : ''
      }`}
      data-testid="service-card"
      data-service={service.slug}
    >
      {direct && isSafeExternalUrl(service.url, namespace) ? (
        <a
          className="service-card__main"
          href={service.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
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
      {recent && (
        <div className="service-card__meta">
          <span className="service-card__recent">
            <Clock3 aria-hidden="true" />
            最近访问
          </span>
        </div>
      )}
    </article>
  )
}

export default function Directory({
  namespace = 'main',
  namespaceLabel,
  introEyebrow,
  introTitle,
  introDescription,
  categories: categoriesProp,
  services: servicesProp,
  serviceBySlug: serviceBySlugProp,
  servicesByCategory: servicesByCategoryProp,
  spatialState,
  recent,
  direct = false,
  onCategory,
  onService,
  onDirectVisit,
}) {
  // Use override props when provided; otherwise fall back to the main catalog.
  const activeCategories = categoriesProp ?? categories
  const activeServices = servicesProp ?? services
  const activeServiceBySlug = serviceBySlugProp ?? serviceBySlug
  const activeServicesByCategory = servicesByCategoryProp ?? servicesByCategory

  return (
    <section
      className={`directory directory--${namespace}`}
      id="service-directory"
      aria-labelledby="directory-title"
      data-namespace={namespace}
    >
      <div className="directory__intro">
        <p className="eyebrow">
          {introEyebrow || `${activeServices.length} 个社团服务入口`}
        </p>
        <h2 id="directory-title">{introTitle || '选择服务，快速访问'}</h2>
        <p>
          {introDescription ||
            '按成员项目、产品服务、通行证生态链、团队与官网分类浏览。'}
        </p>
        {namespaceLabel && <small className="directory__namespace">{namespaceLabel}</small>}
      </div>

      <div className="directory__regions">
        {activeCategories.map((category) => {
          const categoryServices =
            activeServicesByCategory && activeServicesByCategory[category.slug]
              ? activeServicesByCategory[category.slug]
              : activeServices.filter((service) => service.category === category.slug)
          return (
            <section
              className={`directory-region ${
                spatialState?.category === category.slug ? 'is-active' : ''
              }`}
              key={category.slug}
              id={`region-${category.slug}`}
              style={{ '--region-accent': category.accent }}
              aria-labelledby={`region-title-${category.slug}`}
            >
              <button
                type="button"
                className="directory-region__heading"
                onClick={() => onCategory?.(category.slug)}
                aria-label={`聚焦${category.name}`}
              >
                <span className="region-index">
                  0{activeCategories.indexOf(category) + 1}
                </span>
                <span>
                  <strong id={`region-title-${category.slug}`}>{category.name}</strong>
                  <small>{category.description}</small>
                </span>
                <span>{categoryServices.length} 个入口</span>
              </button>

              <div className="service-grid">
                {categoryServices.map((service) => (
                  <ServiceCard
                    key={service.slug}
                    service={service}
                    namespace={namespace}
                    recent={recent.includes(service.slug)}
                    selected={spatialState?.service === service.slug}
                    direct={direct}
                    onSelect={onService}
                    onDirectVisit={onDirectVisit}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {recent.length > 0 && activeServiceBySlug && (
        <aside className="personal-index" aria-label="个人快捷入口">
          <div>
            <span>最近访问</span>
            {recent.map((slug) => {
              const service = activeServiceBySlug[slug]
              if (!service) return null
              const category = activeCategories.find(
                (entry) => entry.slug === service.category,
              )
              return (
                <button key={slug} type="button" onClick={() => onService?.(slug)}>
                  {service.name}
                  {category && namespace === 'oj' ? (
                    <span className="personal-index__hint">·{category.shortName}</span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </aside>
      )}
    </section>
  )
}
