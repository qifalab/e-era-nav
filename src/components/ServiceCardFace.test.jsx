import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { serviceBySlug } from '../data/services'
import ServiceCardFace from './ServiceCardFace'

describe('ServiceCardFace', () => {
  it('renders the original SVG icon, name, and directory intro in directory variant', () => {
    const service = serviceBySlug['era-passport']
    const { container, rerender } = render(
      <ServiceCardFace service={service} variant="directory" />,
    )

    expect(screen.getByText('E时代通行证')).toBeVisible()
    // directory variant 显示 serviceMeta.intro，而不是原始短 description
    expect(screen.getByText(/社团统一账号体系/)).toBeVisible()
    expect(screen.queryByText('统一身份认证与安全管理平台')).not.toBeInTheDocument()
    // directory variant 保持原始产品 SVG 图标不变
    expect(container.querySelector('[data-original-icon="lock"] svg')).toBeInTheDocument()

    rerender(<ServiceCardFace service={service} variant="search" />)
    expect(container.querySelector('.service-card-face--search')).toBeInTheDocument()
    expect(container.querySelector('.service-card-face--spatial')).not.toBeInTheDocument()
    expect(screen.getByText('E时代通行证')).toBeVisible()
    expect(container.querySelector('[data-original-icon="lock"] svg')).toBeInTheDocument()
  })

  it('does not introduce spatial marketing copy', () => {
    render(<ServiceCardFace service={serviceBySlug['era-cloud']} />)
    expect(screen.queryByText(/节点|位置|图鉴|空间/)).not.toBeInTheDocument()
  })

  it('renders tags and intro from serviceMeta', () => {
    render(<ServiceCardFace service={serviceBySlug['era-oj']} variant="directory" />)
    expect(screen.getByText('OJ')).toBeInTheDocument()
    expect(screen.getByText('算法')).toBeInTheDocument()
    expect(screen.getByText('练习')).toBeInTheDocument()
    expect(screen.getByText(/在线评测题库/)).toBeInTheDocument()
  })
})
