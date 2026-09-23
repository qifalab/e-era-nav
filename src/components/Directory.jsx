import { ArrowUpRight, Clock3 } from 'lucide-react'
import { categoryBySlug, serviceBySlug, services } from '../data/services'
import { isSafeExternalUrl } from '../lib/navigation'
import ServiceIcon from './ServiceIcon'
import { getServiceIconConfig } from '../icons/originalIconRegistry'

export default function Directory({ spatialState, recent, query = '', direct = false, onService, onDirectVisit, onReset }) {
  const needle = query.toLocaleLowerCase('zh-CN').replace(/\s+/g, '')
  const visible = services.filter(service => {
    const matchesCategory = !spatialState.category || service.category === spatialState.category
    const text = `${service.name}${service.description}${categoryBySlug[service.category].name}`.toLocaleLowerCase('zh-CN').replace(/\s+/g, '')
    return matchesCategory && (!needle || text.includes(needle))
  })
  return (
    <section className="directory" id="service-directory" aria-labelledby="directory-title">
      <div className="directory-summary">
        <h2 id="directory-title">{spatialState.category ? categoryBySlug[spatialState.category].name : '全部服务'}</h2>
        <span role="status">{visible.length} 个入口</span>
      </div>
      {visible.length ? (
        <div className="catalog-grid service-grid">
          {visible.map(service => {
            const isRecent = recent.includes(service.slug)
            const content = <>
              <div className="catalog-card__head">
                <span className="catalog-card__icon" data-original-icon={service.icon}><ServiceIcon name={service.icon} /></span>
                <h3>{service.name}</h3>
              </div>
              <p className="catalog-card__description">{service.description}</p>
              <div className="catalog-card__meta">
                <span>{categoryBySlug[service.category].shortName}</span>
                {isRecent && <span className="recent-label"><Clock3 aria-hidden="true" />最近访问</span>}
                <ArrowUpRight aria-hidden="true" />
              </div>
            </>
            return (
              <article key={service.slug} className={`catalog-card service-card ${spatialState.service === service.slug ? 'is-selected' : ''}`}
                style={{ '--card-color': getServiceIconConfig(service.slug).geometry.color }}
                data-testid="service-card" data-service={service.slug}>
                {direct && isSafeExternalUrl(service.url) ? (
                  <a href={service.url} target="_blank" rel="noopener noreferrer nofollow" data-direct-service={service.slug}
                    onClick={() => onDirectVisit(service.slug)} onAuxClick={() => onDirectVisit(service.slug)} aria-label={`打开 ${service.name}`}>{content}</a>
                ) : (
                  <button type="button" onClick={() => onService(service.slug)} aria-label={`查看 ${service.name} 详情`}>{content}</button>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="catalog-empty"><p>当前分类中没有匹配的服务</p><button type="button" onClick={onReset}>查看全部服务</button></div>
      )}
      {recent.some(slug => serviceBySlug[slug]) && (
        <aside className="personal-index" aria-label="个人快捷入口">
          <span><Clock3 aria-hidden="true" />最近访问</span>
          {recent.filter(slug => serviceBySlug[slug]).map(slug => (
            <button key={slug} type="button" onClick={() => onService(slug)}>{serviceBySlug[slug].name}</button>
          ))}
        </aside>
      )}
    </section>
  )
}
