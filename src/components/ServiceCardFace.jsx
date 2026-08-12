import { ArrowUpRight } from 'lucide-react'
import { badgeLabels } from '../data/services'
import { getServiceIconConfig } from '../icons/originalIconRegistry'
import ServiceIcon from './ServiceIcon'

export default function ServiceCardFace({
  service,
  variant = 'directory',
  showArrow = true,
  showTags = false,
  showBadge = false,
}) {
  const iconConfig = getServiceIconConfig(service.slug)
  const badgeLabel = service.badge ? badgeLabels[service.badge] : ''
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
        <strong>
          {service.name}
          {showBadge && badgeLabel && (
            <em className={`service-badge service-badge--${service.badge}`}>{badgeLabel}</em>
          )}
        </strong>
        <span>{service.description}</span>
        {showTags && service.tags?.length > 0 && (
          <span className="service-card-face__tags" aria-label="服务标签">
            {service.tags.map((tag) => (
              <em key={tag}>#{tag}</em>
            ))}
          </span>
        )}
      </span>
      {showArrow && <ArrowUpRight className="service-card-face__arrow" aria-hidden="true" />}
    </div>
  )
}
