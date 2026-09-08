import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SceneLoading from './SceneLoading'

afterEach(() => { cleanup(); vi.useRealTimers() })

describe('3D loading recovery', () => {
  it('offers an immediate accessible route to the service list', () => {
    const onUseList = vi.fn()
    render(<SceneLoading onUseList={onUseList} onTimeout={() => {}} />)
    expect(screen.getByRole('status')).toHaveTextContent('正在准备 3D 导航')
    fireEvent.click(screen.getByRole('button', { name: '先用 2D 服务列表' }))
    expect(onUseList).toHaveBeenCalledOnce()
  })
  it('falls back after 20 seconds without a completed model load', () => {
    vi.useFakeTimers()
    const onTimeout = vi.fn()
    render(<SceneLoading onUseList={() => {}} onTimeout={onTimeout} />)
    act(() => vi.advanceTimersByTime(19999))
    expect(onTimeout).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onTimeout).toHaveBeenCalledOnce()
  })
  it('cancels the timeout when the scene finishes loading', () => {
    vi.useFakeTimers()
    const onTimeout = vi.fn()
    const { unmount } = render(<SceneLoading onUseList={() => {}} onTimeout={onTimeout} />)
    act(() => vi.advanceTimersByTime(1000))
    unmount()
    act(() => vi.advanceTimersByTime(20000))
    expect(onTimeout).not.toHaveBeenCalled()
  })
})
