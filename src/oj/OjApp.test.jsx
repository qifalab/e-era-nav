import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import OjApp from './OjApp'
import { ojs } from './OjData'

describe('E时代刷题导航', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.ojTheme
  })

  it('展示全部平台并可返回主站', () => {
    const { container } = render(<OjApp />)

    expect(
      [...container.querySelectorAll('.oj-visually-hidden')].map((node) => node.textContent),
    ).toEqual(['让每一次', '刷题都更高效'])
    expect(screen.getAllByRole('article')).toHaveLength(ojs.length)
    expect(
      screen.getByRole('link', { name: '切换到主站导航（E时代社团服务导航）' }),
    ).toHaveAttribute('href', '/')
    expect(screen.getByRole('region', { name: '刷题小贴士' })).toBeInTheDocument()
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
    expect(document.documentElement).toHaveAttribute('data-oj-theme', 'dark')
    expect(localStorage.getItem('oj.theme')).toBe('dark')
  })
})
