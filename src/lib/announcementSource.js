// 公告数据源（可插拔适配器）。
// 当前默认实现：浏览器 localStorage。后续接入 Git 提交流 / Node 后台 / 边缘 KV 时，
// 只需替换下方 loadAnnouncement / saveAnnouncement 的实现，调用方接口保持不变。

const STORAGE_KEY = 'era-announcement-v2'

// 种子内容：尚未被管理员保存过时回退展示。首次打开即显示这条公告。
export const ANNOUNCEMENT_SEED = `新同学记得点击链接加入我们在牛客的团队https://www.nowcoder.com/problem/tracker#/inviteTeam/664212839，推荐在这里牛客题单里练习，构建知识体系，0基础建议先学完基础语法。`

export function loadAnnouncement() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored != null) return stored
  } catch {
    // localStorage 不可用（隐私模式等）时回退到种子内容
  }
  return ANNOUNCEMENT_SEED
}

export function saveAnnouncement(text) {
  try {
    localStorage.setItem(STORAGE_KEY, text)
  } catch {
    // 写入失败（如隐私模式）时静默忽略
  }
}
