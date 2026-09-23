export default function SiteFooter() {
  const rel = 'noopener noreferrer nofollow'
  return (
    <footer className="site-footer">
      <div><strong>E时代</strong><span>科技创新，连接未来</span></div>
      <nav aria-label="站点相关链接">
        <a href="https://we.emoera.com/" target="_blank" rel={rel}>关于我们</a>
        <a href="https://www.qifalab.cn/" target="_blank" rel={rel}>技术支持</a>
        <a href="https://docs.qq.com/aio/DVHZpRFFTdUVIYlV2?p=BvAba1pUjsuoDHKNY65azz" target="_blank" rel={rel}>更新日志</a>
        <a href="https://www.qifalab.cn/qifalab-v1/contact.html" target="_blank" rel={rel}>意见反馈</a>
      </nav>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel={rel}>蜀ICP备2024055741号</a>
      <span>© {new Date().getFullYear()} E时代科技</span>
    </footer>
  )
}
