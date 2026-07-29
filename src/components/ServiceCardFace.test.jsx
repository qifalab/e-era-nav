import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { serviceBySlug } from '../data/services'
import ServiceCardFace from './ServiceCardFace'

describe('ServiceCardFace', () => {
  it('renders the original icon, name, and description as one reusable card face', () => {
    const service = serviceBySlug['era-passport']
    const { container, rerender } = render(
      <ServiceCardFace service={service} variant="directory" />,
    )

    expect(screen.getByText('E时代通行证')).toBeVisible()
    expect(screen.getByText('统一身份认证与安全管理平台')).toBeVisible()
    expect(container.querySelector('[data-original-icon="lock"] svg')).toBeInTheDocument()

    rerender(<ServiceCardFace service={service} variant="search" />)
    expect(container.querySelector('.service-card-face--search')).toBeInTheDocument()
    expect(container.querySelector('.service-card-face--spatial')).not.toBeInTheDocument()
    expect(screen.getByText('E时代通行证')).toBeVisible()
  })

  it('does not introduce spatial marketing copy', () => {
    render(<ServiceCardFace service={serviceBySlug['era-cloud']} />)
    expect(screen.queryByText(/节点|位置|图鉴|空间/)).not.toBeInTheDocument()
  })
})
