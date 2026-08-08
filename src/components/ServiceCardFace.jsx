import { ArrowUpRight } from 'lucide-react'
import { getServiceIconConfig } from '../icons/originalIconRegistry'
import { serviceMeta } from '../data/services'
import ServiceIcon from './ServiceIcon'

export default function ServiceCardFace({
  service,
  variant = 'directory',
  showArrow = true,
}) {
  const iconConfig = getServiceIconConfig(service.slug)
  const meta = serviceMeta[service.slug] || {}
  const tags = meta.tags || []
  // 目录卡片使用更详细的一句话介绍，保持与副导航卡片一致的紧凑高度
  const cardDescription =
    variant === 'directory' ? meta.intro || service.description : service.description
  return (
    <div
      className={`service-card-face service-card-face--${variant}`}
      data-service={service.slug}
      data-original-icon={service.icon}
    >
      <span
        className="service-card-face__icon"
        style={{ '--service-icon-color': iconConfig.geometry.color }}
      >
        <ServiceIcon name={service.icon} />
      </span>
      <span className="service-card-face__copy">
        <strong>{service.name}</strong>
        <span>{cardDescription}</span>
        {tags.length > 0 && (
          <span className="service-card-face__tags">
            {tags.map((tag) => (
              <span className="service-tag" key={tag}>
                {tag}
              </span>
            ))}
          </span>
        )}
      </span>
      {showArrow && <ArrowUpRight className="service-card-face__arrow" aria-hidden="true" />}
    </div>
  )
}
