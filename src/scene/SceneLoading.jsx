import { useEffect } from 'react'
import { categories } from '../data/services'

export default function SceneLoading({ onUseList, onTimeout }) {
  useEffect(() => {
    const timer = window.setTimeout(onTimeout, 20000)
    return () => window.clearTimeout(timer)
  }, [onTimeout])

  return (
    <div className="scene-loading-panel" data-testid="model-loading">
      <div className="scene-loading-preview" aria-hidden="true">
        {categories.map((category, index) => (
          <div className="scene-loading-island" key={category.slug} style={{ '--island-color': category.glow }}>
            <div className="scene-loading-pieces">
              {Array.from({ length: index === 0 ? 1 : 4 }, (_, piece) => <i key={piece} />)}
            </div>
            <span>{category.shortName}</span>
          </div>
        ))}
      </div>
      <div className="scene-loading-message" role="status">
        <span className="scene-loading-spinner" aria-hidden="true" />
        <strong>正在准备 3D 导航</strong>
        <p>下方服务列表可正常使用</p>
      </div>
      <button type="button" className="scene-loading-action" onClick={onUseList}>先用 2D 服务列表</button>
    </div>
  )
}
