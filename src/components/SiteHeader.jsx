import { Moon, Sun } from 'lucide-react'
import '../SiteShell.css'

/** 两个入口共用固定栏目名称；选中状态只表示当前位置。 */
export default function SiteHeader({ section, theme, onTheme, themeRef, children }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-brand" href="/" aria-label="E时代导航首页">
          <picture>
            <source type="image/webp" srcSet="/brand/e-era-logo-96.webp 1x, /brand/e-era-logo-192.webp 2x" />
            <img src="/brand/e-era-logo-96.png" width="36" height="36" alt="E时代品牌标识" />
          </picture>
          <span>E时代导航</span>
        </a>
        <nav className="site-sections" aria-label="导航栏目">
          <a href="/" aria-current={section === 'services' ? 'page' : undefined}>服务导航</a>
          <a href="/oj/" aria-current={section === 'practice' ? 'page' : undefined}>刷题导航</a>
        </nav>
        <div className="site-header__actions">
          <button ref={themeRef} className="icon-button theme-button" type="button" onClick={onTheme}
            aria-label={`切换到${theme === 'dark' ? '浅色' : '深色'}主题`}>
            {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          {children}
        </div>
      </div>
    </header>
  )
}
