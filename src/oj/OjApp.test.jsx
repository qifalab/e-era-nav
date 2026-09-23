import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import OjApp from './OjApp'
import { ojs } from './OjData'

describe('E时代刷题导航', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/oj/')
    delete document.documentElement.dataset.theme
    document.documentElement.style.colorScheme = ''
  })

  it('展示全部平台并可返回主站', () => {
    const { container } = render(<OjApp />)

    expect(screen.getByRole('heading', { level: 1, name: '刷题导航' })).toBeVisible()
    expect(screen.getByRole('link', { name: '刷题导航' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByRole('article')).toHaveLength(ojs.length)
    expect(screen.getByAltText('E时代品牌标识')).toHaveAttribute(
      'src',
      '/brand/e-era-logo-96.png',
    )
    expect(screen.getByRole('link', { name: '服务导航', exact: true })).toHaveAttribute('href', '/')
    expect(screen.getByRole('region', { name: '刷题小贴士' })).toBeInTheDocument()
    expect(container.querySelector('.oj-tip__video')).not.toBeInTheDocument()
    expect(container.querySelector('a[href*="bilibili.com"]')).not.toBeInTheDocument()

    const externalLinks = [...container.querySelectorAll('a[href^="http"]')]
    expect(externalLinks.length).toBeGreaterThan(0)
    externalLinks.forEach((link) => {
      expect(link.relList.contains('noopener')).toBe(true)
      expect(link.relList.contains('noreferrer')).toBe(true)
      expect(link.relList.contains('nofollow')).toBe(true)
    })

    expect(screen.getByRole('link', { name: '服务导航', exact: true })).not.toHaveAttribute(
      'rel',
      expect.stringContaining('nofollow'),
    )
  })

  it('支持搜索、分类筛选与主题切换', async () => {
    render(<OjApp />)

    fireEvent.change(screen.getByRole('searchbox', { name: '搜索刷题平台' }), {
      target: { value: 'Codeforces' },
    })
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    expect(screen.getByRole('link', { name: '访问 Codeforces' })).toHaveAttribute(
      'href',
      'https://codeforces.com/',
    )

    fireEvent.click(screen.getByRole('button', { name: '清除搜索' }))
    fireEvent.click(screen.getByRole('button', { name: /竞赛资源/ }))
    await waitFor(() =>
      expect(screen.getAllByRole('article')).toHaveLength(
        ojs.filter((oj) => oj.category === 'contest').length,
      ),
    )

    fireEvent.click(screen.getByRole('button', { name: '切换到深色主题' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(localStorage.getItem('e-era:theme')).toBe('dark')
  })
  it('浏览器后退恢复筛选，资源深链接定位到原目标', async () => {
    window.history.replaceState({}, '', '/oj/?category=contest&service=leetcode-cn')
    render(<OjApp />)
    expect(window.location.pathname).toBe('/oj/')
    expect(window.location.search).toBe('?category=platform&service=leetcode')
    expect(screen.getByRole('link', { name: '访问 力扣 LeetCode' })).toHaveAttribute('href', 'https://leetcode.cn/')
    fireEvent.click(screen.getByRole('button', { name: /基础学习/ }))
    expect(screen.getAllByRole('article')).toHaveLength(7)
    window.history.replaceState({}, '', '/oj/?category=contest&q=XCPC')
    fireEvent.popState(window)
    expect(screen.getByRole('searchbox', { name: '搜索刷题平台' })).toHaveValue('XCPC')
    expect(screen.getByRole('button', { name: /竞赛资源/ })).toHaveAttribute('aria-pressed', 'true')
    expect(document.title).toBe('刷题导航 · E时代导航')
  })
})
