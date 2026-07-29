import { ArrowUpRight } from 'lucide-react'
import { getServiceIconConfig } from '../icons/originalIconRegistry'
import ServiceIcon from './ServiceIcon'

export default function ServiceCardFace({
  service,
  variant = 'directory',
  showArrow = true,
}) {
  const iconConfig = getServiceIconConfig(service.slug)
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
        <span>{service.description}</span>
      </span>
      {showArrow && <ArrowUpRight className="service-card-face__arrow" aria-hidden="true" />}
    </div>
  )
}
