import { Clock3 } from 'lucide-react'
import { categories, serviceBySlug, services, servicesByCategory } from '../data/services'
import { isSafeExternalUrl } from '../lib/navigation'
import ServiceCardFace from './ServiceCardFace'

function ServiceCard({ service, recent, selected, direct, onSelect, onDirectVisit }) {
  const content = <ServiceCardFace service={service} />
  return (
    <article
      className={`service-card ${selected ? 'is-selected' : ''} ${
        recent ? 'has-recent' : ''
      }`}
      data-testid="service-card"
      data-service={service.slug}
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
  spatialState,
  recent,
  direct = false,
  onCategory,
  onService,
  onDirectVisit,
}) {
  return (
    <section className="directory" id="service-directory" aria-labelledby="directory-title">
      <div className="directory__intro">
        <p className="eyebrow">{services.length} 个社团服务入口</p>
        <h2 id="directory-title">选择服务，快速访问</h2>
        <p>按成员项目、产品服务、通行证生态链、团队与官网分类浏览。</p>
      </div>

      <div className="directory__regions">
        {categories.map((category) => (
          <section
            className={`directory-region ${
              spatialState.category === category.slug ? 'is-active' : ''
            }`}
            key={category.slug}
            id={`region-${category.slug}`}
            style={{ '--region-accent': category.accent }}
            aria-labelledby={`region-title-${category.slug}`}
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
              {servicesByCategory[category.slug].map((service) => (
                <ServiceCard
                  key={service.slug}
                  service={service}
                  recent={recent.includes(service.slug)}
                  selected={spatialState.service === service.slug}
                  direct={direct}
                  onSelect={onService}
                  onDirectVisit={onDirectVisit}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

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
