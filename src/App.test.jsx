import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { preferenceKeys } from './lib/preferences'
import { ojResourceCount } from './data/ojResources'

vi.mock('./scene/SpatialScene', () => ({
  default: ({ onCategory, onService, onFallback }) => (
    <div data-testid="spatial-scene">
      <button type="button" onClick={() => onCategory('products')}>
        模拟聚焦产品区
      </button>
      <button type="button" onClick={() => onService('era-cloud')}>
        模拟聚焦云服务
      </button>
      <button type="button" onClick={() => onFallback('模拟上下文丢失')}>
        模拟 WebGL 丢失
      </button>
    </div>
  ),
}))

vi.mock('./lib/capabilities', () => ({
  detectCapabilities: () => ({
    webgl: true,
    hardwareConcurrency: 8,
    deviceMemory: 8,
    saveData: false,
    recommendedMode: '3d',
  }),
}))

describe('E时代社团服务导航', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
  })

  it('保留完整 18 个入口和四个服务分类', async () => {
    render(<App />)

    expect(await screen.findByTestId('spatial-scene')).toBeInTheDocument()
    expect(screen.getByText('E时代社团服务导航', { selector: '.brand strong' })).toBeVisible()
    const heroTitle = screen.getByRole('heading', {
      level: 1,
      name: /E时代社团\s*服务导航/,
    })
    expect(heroTitle).toBeVisible()
    expect([...heroTitle.querySelectorAll('span')].map((span) => span.textContent)).toEqual([
      'E时代社团',
      '服务导航',
    ])
    expect(screen.getByText(/快速访问社团开发、通行证与团队服务/)).toBeVisible()
    expect(screen.queryByText(/让每个入口|拥有自己的位置|Spatial Service Atlas/)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: '当前服务路径' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '首页' })).not.toBeInTheDocument()
    expect(screen.getAllByTestId('service-card')).toHaveLength(18)
    expect(screen.getByText('产品服务', { selector: '.region-legend strong' })).toBeInTheDocument()
    expect(screen.getByText('通行证生态链', { selector: '.region-legend strong' })).toBeInTheDocument()
    expect(screen.getByText('团队与官网', { selector: '.region-legend strong' })).toBeInTheDocument()
    expect(
      screen.getByText('E时代社团成员项目', { selector: '.region-legend strong' }),
    ).toBeInTheDocument()
  })

  it('使用本地品牌资产且不把品牌 Logo 用作模块图形', async () => {
    const { container } = render(<App />)
    await screen.findByTestId('spatial-scene')

    expect(screen.getByAltText('E时代品牌标识')).toHaveAttribute(
      'src',
      '/brand/e-era-logo-96.png',
    )
    expect(screen.getByAltText('E时代协会品牌标识')).toHaveAttribute(
      'src',
      '/brand/e-era-logo-192.png',
    )
    const serviceIcons = [...container.querySelectorAll('[data-original-icon]')]
    expect(serviceIcons).toHaveLength(18)
    expect(new Set(serviceIcons.map((element) => element.dataset.originalIcon)).size).toBe(17)
    expect(container.querySelector('[src*="we.emoera.com"]')).not.toBeInTheDocument()
  })

  it('Cmd/Ctrl+K、方向键和 Enter 可搜索并聚焦目标', async () => {
    render(<App />)
    await screen.findByTestId('spatial-scene')

    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    const search = screen.getByRole('combobox', { name: '搜索服务' })
    expect(search).toHaveFocus()
    fireEvent.change(search, { target: { value: '图' } })
    fireEvent.keyDown(search, { key: 'ArrowDown' })
    fireEvent.keyDown(search, { key: 'ArrowUp' })
    fireEvent.keyDown(search, { key: 'Enter' })

    expect(
      screen.getByRole('navigation', { name: '当前服务路径' }),
    ).toHaveTextContent('总览/通行证生态链/E时代图床')
  })

  it('完全移除收藏入口但保留最近访问', async () => {
    render(<App />)
    await screen.findByTestId('spatial-scene')

    expect(screen.queryByRole('button', { name: /收藏/ })).not.toBeInTheDocument()
    expect(screen.queryByText('收藏')).not.toBeInTheDocument()
    expect(preferenceKeys.favorites).toBeUndefined()

    fireEvent.click(screen.getByRole('button', { name: '查看 E时代云服务 详情' }))
    const serviceDialog = screen.getByRole('dialog', { name: 'E时代云服务' })
    const visit = within(serviceDialog).getByRole('link', { name: '访问服务' })
    expect(visit).toHaveAttribute('href', 'https://cloud.emoera.com/')
    expect(visit).toHaveAttribute('target', '_blank')
    expect(visit).toHaveAttribute('rel', 'noopener noreferrer')
    fireEvent.click(visit)
    expect(
      screen.queryByRole('dialog', { name: '即将离开 E时代导航' }),
    ).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(preferenceKeys.recent))[0]).toBe(
      'era-cloud',
    )
  })

  it('可返回首页并手动切换完整 2D 服务列表', async () => {
    render(<App />)
    await screen.findByTestId('spatial-scene')

    fireEvent.click(screen.getByRole('button', { name: '模拟聚焦产品区' }))
    expect(
      screen.getByRole('navigation', { name: '当前服务路径' }),
    ).toHaveTextContent('总览/产品服务')
    fireEvent.click(screen.getByRole('button', { name: '返回导航首页' }))
    expect(
      screen.queryByRole('navigation', { name: '当前服务路径' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '切换到2D模式' }))
    expect(screen.getByText('已手动切换为 2D 服务列表。')).toBeInTheDocument()
    expect(screen.getAllByTestId('service-card')).toHaveLength(18)
  })

  it('WebGL 运行失败时自动降级且功能不丢失', async () => {
    render(<App />)
    await screen.findByTestId('spatial-scene')

    fireEvent.click(screen.getByRole('button', { name: '模拟 WebGL 丢失' }))
    expect(screen.getByText('模拟上下文丢失')).toBeInTheDocument()
    expect(screen.getAllByTestId('service-card')).toHaveLength(18)
  })

  it('默认不弹操作提示，仅显式帮助动作打开并恢复焦点', () => {
    render(<App />)

    expect(
      screen.queryByRole('dialog', { name: '服务导航' }),
    ).not.toBeInTheDocument()
    const helpButton = screen.getByRole('button', { name: '公告' })
    helpButton.focus()
    fireEvent.click(helpButton)
    const dialog = screen.getByRole('dialog', { name: '服务导航' })
    expect(within(dialog).getByRole('tab', { name: '操作说明与快捷键' })).toBeInTheDocument()
    expect(within(dialog).getByRole('tab', { name: '公告' })).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('tab', { name: '操作说明与快捷键' }))
    expect(within(dialog).getByText('按分类浏览')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: '关闭' }))
    expect(
      screen.queryByRole('dialog', { name: '服务导航' }),
    ).not.toBeInTheDocument()
    expect(helpButton).toHaveFocus()
  })

  it('支持明暗主题切换', async () => {
    render(<App />)
    await screen.findByTestId('spatial-scene')
    fireEvent.click(screen.getByRole('button', { name: '切换到深色主题' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')

    // 切换按钮渲染成图标按钮：可重复切换，点击触发以按钮为圆心的涟漪过渡。
    const switch_ = screen.getByRole('button', { name: '切换到浅色主题' })
    expect(switch_.className).toMatch(/theme-button/)

    // 不支持 View Transitions 的环境也能直接切：data-theme 立刻翻转。
    const originalStartViewTransition = document.startViewTransition
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: undefined,
    })
    fireEvent.click(switch_)
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: originalStartViewTransition,
    })
  })

  it('搜索无结果时提供状态反馈并可清除', async () => {
    render(<App />)
    await screen.findByTestId('spatial-scene')
    const search = screen.getByRole('combobox', { name: '搜索服务' })

    fireEvent.change(search, { target: { value: '不存在的社团服务' } })
    expect(screen.getByText('没有匹配的服务')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '清除搜索' }))
    expect(search).toHaveValue('')
  })

  it('组合快捷键可导航区域、返回、回家和打开帮助', async () => {
    render(<App />)
    await screen.findByTestId('spatial-scene')

    fireEvent.keyDown(window, { key: '1', altKey: true })
    expect(window.location.search).toContain('category=members')
    fireEvent.keyDown(window, { key: 'b', altKey: true })
    expect(window.location.search).toBe('')
    fireEvent.keyDown(window, { key: '4', altKey: true })
    expect(window.location.search).toContain('category=team')
    fireEvent.keyDown(window, { key: 'h', altKey: true })
    expect(window.location.search).toBe('')
    fireEvent.keyDown(window, { key: '?', altKey: true })
    expect(
      screen.getByRole('dialog', { name: '服务导航' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '关闭' }))
  })

  it('手动 2D 与 3D 模式可往返切换', async () => {
    render(<App />)
    await screen.findByTestId('spatial-scene')

    fireEvent.click(screen.getByRole('button', { name: '切换到2D模式' }))
    fireEvent.click(screen.getByRole('button', { name: '切换到3D模式' }))
    expect(await screen.findByTestId('spatial-scene')).toBeInTheDocument()
    expect(localStorage.getItem(preferenceKeys.renderMode)).toBe('3d')
  })

  it('2D 卡片直接链接，搜索仍保持详情流程', async () => {
    const open = vi.spyOn(window, 'open')
    render(<App />)
    await screen.findByTestId('spatial-scene')
    fireEvent.click(screen.getByRole('button', { name: '切换到2D模式' }))

    const direct = screen.getByRole('link', { name: '打开 E时代云服务' })
    expect(direct).toHaveAttribute('href', 'https://cloud.emoera.com/')
    expect(direct).toHaveAttribute('target', '_blank')
    expect(direct).toHaveAttribute('rel', 'noopener noreferrer')
    fireEvent.click(direct)
    expect(screen.queryByRole('dialog', { name: 'E时代云服务' })).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(preferenceKeys.recent))[0]).toBe('era-cloud')

    const search = screen.getByRole('combobox', { name: '搜索服务' })
    fireEvent.change(search, { target: { value: 'E时代Git' } })
    fireEvent.keyDown(search, { key: 'Enter' })
    expect(screen.getByRole('dialog', { name: 'E时代Git' })).toBeInTheDocument()
    expect(open).not.toHaveBeenCalled()
    open.mockRestore()
  })

  it('浏览器 popstate 可恢复安全深链状态', async () => {
    render(<App />)
    await screen.findByTestId('spatial-scene')
    window.history.pushState(
      {},
      '',
      '/?category=team&service=era-oj',
    )
    fireEvent.popState(window)
    expect(screen.getByRole('dialog', { name: 'E时代OJ' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '关闭' }))
    expect(window.location.search).toBe('?category=team')
  })

  it('离线时保留浏览但禁止外链访问', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    render(<App />)
    await screen.findByTestId('spatial-scene')

    expect(screen.getByText(/当前离线/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '查看 E时代云服务 详情' }))
    expect(
      screen.getByRole('button', { name: '访问服务' }),
    ).toBeDisabled()
  })

  it('右上角胶囊可切换主/副导航并隔离资源与渲染模式', async () => {
    render(<App />)
    await screen.findByTestId('spatial-scene')

    // 默认主导航：18 个社团服务卡片 + 3D 场景。
    expect(screen.getByText('E时代社团服务导航', { selector: '.brand strong' })).toBeVisible()
    expect(screen.getAllByTestId('service-card')).toHaveLength(18)

    // 切到副导航（OJ 刷题）。
    fireEvent.click(
      screen.getByRole('button', { name: '切换到副导航：OJ 刷题资源' }),
    )
    expect(window.location.search).toContain('namespace=oj')
    expect(screen.getByText('E时代 OJ 刷题导航', { selector: '.brand strong' })).toBeVisible()
    expect(screen.queryByTestId('spatial-scene')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /E时代 OJ\s*刷题资源导航/ })).toBeInTheDocument()
    expect(screen.getByText('Codeforces')).toBeInTheDocument()
    expect(screen.getByText('洛谷')).toBeInTheDocument()
    expect(screen.getAllByTestId('service-card')).toHaveLength(ojResourceCount)
    // 3D 模式切换在副导航下被禁用（强制 2D 列表）。
    expect(
      screen.getByRole('button', { name: '副导航固定为 2D 列表' }),
    ).toBeDisabled()

    // 切回主导航。
    fireEvent.click(screen.getByRole('button', { name: '切换到主导航：E时代社团服务' }))
    expect(window.location.search).not.toContain('namespace=oj')
    expect(screen.getByText('E时代社团服务导航', { selector: '.brand strong' })).toBeVisible()
    expect(await screen.findByTestId('spatial-scene')).toBeInTheDocument()
    expect(screen.getAllByTestId('service-card')).toHaveLength(18)
  })
})
