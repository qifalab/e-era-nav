export function detectWebGL(canvas = document.createElement('canvas')) {
  try {
    const options = {
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    }
    const context =
      canvas.getContext('webgl2', options) || canvas.getContext('webgl', options)
    if (!context) return false

    const debugInfo = context.getExtension?.('WEBGL_debug_renderer_info')
    const renderer = debugInfo
      ? String(context.getParameter?.(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
      : ''
    const softwareRenderer = /swiftshader|llvmpipe|software rasterizer/i.test(
      renderer,
    )

    context.getExtension?.('WEBGL_lose_context')?.loseContext?.()
    return !softwareRenderer
  } catch {
    return false
  }
}

export function chooseRenderMode({
  webgl,
  hardwareConcurrency = 8,
  deviceMemory = 8,
  saveData = false,
}) {
  if (!webgl || saveData || hardwareConcurrency <= 2 || deviceMemory <= 2) return '2d'
  return '3d'
}

export function detectCapabilities() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  const details = {
    webgl: detectWebGL(),
    hardwareConcurrency: navigator.hardwareConcurrency || 8,
    deviceMemory: navigator.deviceMemory || 8,
    saveData: Boolean(connection?.saveData),
  }

  return {
    ...details,
    recommendedMode: chooseRenderMode(details),
  }
}
