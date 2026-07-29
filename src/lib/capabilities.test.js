import { describe, expect, it, vi } from 'vitest'
import { chooseRenderMode, detectCapabilities, detectWebGL } from './capabilities'

describe('render capability selection', () => {
  it('selects 3D for a capable device', () => {
    expect(
      chooseRenderMode({
        webgl: true,
        hardwareConcurrency: 8,
        deviceMemory: 8,
        saveData: false,
      }),
    ).toBe('3d')
  })

  it.each([
    { webgl: false, hardwareConcurrency: 8, deviceMemory: 8, saveData: false },
    { webgl: true, hardwareConcurrency: 2, deviceMemory: 8, saveData: false },
    { webgl: true, hardwareConcurrency: 8, deviceMemory: 2, saveData: false },
    { webgl: true, hardwareConcurrency: 8, deviceMemory: 8, saveData: true },
  ])('falls back to 2D for constrained devices', (capabilities) => {
    expect(chooseRenderMode(capabilities)).toBe('2d')
  })

  it('reports unavailable WebGL without throwing', () => {
    const canvas = {
      getContext: vi.fn(() => null),
    }
    expect(detectWebGL(canvas)).toBe(false)
  })

  it('accepts WebGL 2 or WebGL 1 and contains context errors', () => {
    expect(detectWebGL({ getContext: vi.fn(() => ({})) })).toBe(true)
    expect(
      detectWebGL({
        getContext: vi
          .fn()
          .mockReturnValueOnce(null)
          .mockReturnValueOnce({}),
      }),
    ).toBe(true)
    expect(
      detectWebGL({
        getContext: vi.fn(() => {
          throw new Error('context lost')
        }),
      }),
    ).toBe(false)
  })

  it('rejects software-only renderers', () => {
    const debugInfo = { UNMASKED_RENDERER_WEBGL: 1 }
    const context = {
      getExtension: vi.fn((name) =>
        name === 'WEBGL_debug_renderer_info' ? debugInfo : null,
      ),
      getParameter: vi.fn(() => 'Google SwiftShader'),
    }
    expect(detectWebGL({ getContext: vi.fn(() => context) })).toBe(false)
  })

  it('collects browser signals into a recommendation', () => {
    const createElement = vi
      .spyOn(document, 'createElement')
      .mockReturnValue({ getContext: vi.fn(() => ({})) })
    Object.defineProperties(navigator, {
      hardwareConcurrency: { configurable: true, value: 8 },
      deviceMemory: { configurable: true, value: 8 },
      connection: { configurable: true, value: { saveData: false } },
    })

    expect(detectCapabilities()).toMatchObject({
      webgl: true,
      saveData: false,
      recommendedMode: '3d',
    })
    createElement.mockRestore()
  })
})
