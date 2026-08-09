// 副导航图标库：与主导航 ICON_DEFINITIONS 同构、本地可审计。
// 任何 path 都遵守同一份白名单（tag / attribute / 长度 1200 / 无尖括号）。

const element = (tag, attrs) => ({ tag, attrs })

export const OJ_ICON_DEFINITIONS = {
  'book-open': {
    label: '打开的书',
    elements: [
      element('path', {
        d: 'M2 5h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H2z',
      }),
      element('path', {
        d: 'M22 5h-6a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h6z',
      }),
    ],
  },
  graduation: {
    label: '毕业帽',
    elements: [
      element('path', { d: 'M22 10L12 5 2 10l10 6 10-6z' }),
      element('path', { d: 'M6 12v4a6 6 0 0 0 12 0v-4' }),
      element('path', { d: 'M22 10v5' }),
    ],
  },
  route: {
    label: '路线',
    elements: [
      element('circle', { cx: 5, cy: 5, r: 2 }),
      element('circle', { cx: 19, cy: 19, r: 2 }),
      element('path', { d: 'M7 5h6a4 4 0 0 1 4 4v6' }),
    ],
  },
  video: {
    label: '视频',
    elements: [
      element('rect', { x: 2, y: 6, width: 14, height: 12, rx: 2 }),
      element('path', { d: 'M22 8l-6 4 6 4z' }),
    ],
  },
  trophy: {
    label: '奖杯',
    elements: [
      element('path', { d: 'M7 4h10v5a5 5 0 0 1-10 0z' }),
      element('path', { d: 'M5 4h2v3a3 3 0 0 1-3-3z' }),
      element('path', { d: 'M19 4h2a3 3 0 0 1-3 3V4z' }),
      element('path', { d: 'M9 14h6v3H9z' }),
      element('path', { d: 'M8 20h8' }),
    ],
  },
  fire: {
    label: '火焰',
    elements: [
      element('path', {
        d: 'M12 2c1 4 4 5 4 9a4 4 0 1 1-8 0c0-2 2-3 2-5',
      }),
      element('path', {
        d: 'M8 18a4 4 0 0 0 8 0',
      }),
    ],
  },
  play: {
    label: '播放',
    elements: [
      element('circle', { cx: 12, cy: 12, r: 10 }),
      element('path', { d: 'M10 8l6 4-6 4z' }),
    ],
  },
  a: {
    label: '字母 A',
    elements: [
      element('path', { d: 'M5 22L12 4l7 18' }),
      element('path', { d: 'M8 16h8' }),
    ],
  },
  puzzle: {
    label: '拼图',
    elements: [
      element('path', {
        d: 'M19 11h-1V8a1 1 0 0 0-1-1h-3V6a1 1 0 0 0-2 0v1H9a1 1 0 0 0-1 1v3H6a1 1 0 0 0 0 2h2v3a1 1 0 0 0 1 1h3a1 1 0 0 1 2 0v-1a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1v-3h1a1 1 0 0 0 0-2z',
      }),
    ],
  },
  briefcase: {
    label: '公文包',
    elements: [
      element('rect', { x: 2, y: 7, width: 20, height: 14, rx: 2 }),
      element('path', { d: 'M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
    ],
  },
  'bar-chart': {
    label: '柱状图',
    elements: [
      element('line', { x1: 6, y1: 20, x2: 6, y2: 14 }),
      element('line', { x1: 12, y1: 20, x2: 12, y2: 10 }),
      element('line', { x1: 18, y1: 20, x2: 18, y2: 4 }),
      element('line', { x1: 3, y1: 20, x2: 21, y2: 20 }),
    ],
  },
  compass: {
    label: '指南针',
    elements: [
      element('circle', { cx: 12, cy: 12, r: 10 }),
      element('path', { d: 'M16 8l-2 6-6 2 2-6z' }),
    ],
  },
  search: {
    label: '放大镜',
    elements: [
      element('circle', { cx: 11, cy: 11, r: 7 }),
      element('line', { x1: 21, y1: 21, x2: 16, y2: 16 }),
    ],
  },
  library: {
    label: '书架',
    elements: [
      element('rect', { x: 4, y: 4, width: 3, height: 16 }),
      element('rect', { x: 9, y: 4, width: 3, height: 16 }),
      element('rect', { x: 14, y: 4, width: 3, height: 16 }),
      element('line', { x1: 4, y1: 20, x2: 17, y2: 20 }),
    ],
  },
  map: {
    label: '地图',
    elements: [
      element('path', { d: 'M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2z' }),
      element('path', { d: 'M9 4v14' }),
      element('path', { d: 'M15 6v14' }),
    ],
  },
  database: {
    label: '数据库',
    elements: [
      element('ellipse', { cx: 12, cy: 5, rx: 9, ry: 3 }),
      element('path', { d: 'M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5' }),
      element('path', { d: 'M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6' }),
    ],
  },
  sparkles: {
    label: '闪光',
    elements: [
      element('path', { d: 'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z' }),
      element('path', { d: 'M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z' }),
    ],
  },
}

Object.values(OJ_ICON_DEFINITIONS).forEach((definition) => {
  definition.viewBox = '0 0 24 24'
  definition.strokeWidth = 2
  definition.elements.forEach((item) => Object.freeze(item.attrs))
  definition.elements.forEach(Object.freeze)
  Object.freeze(definition.elements)
  Object.freeze(definition)
})
Object.freeze(OJ_ICON_DEFINITIONS)

// 副导航 20 个 OJ/刷题资源 → 共享几何色板
export const OJ_ICON_REGISTRY = {
  'emoera-portal': { originalIcon: 'globe', geometry: { source: 'globe', color: '#4f8fc9' } },
  'oi-wiki': { originalIcon: 'book-open', geometry: { source: 'book-open', color: '#256a64' } },
  acwing: { originalIcon: 'graduation', geometry: { source: 'graduation', color: '#b77b2f' } },
  'nowcoder-tracker': { originalIcon: 'route', geometry: { source: 'route', color: '#2f7f78' } },
  'bilibili-guide': { originalIcon: 'video', geometry: { source: 'video', color: '#fb7299' } },
  codeforces: { originalIcon: 'trophy', geometry: { source: 'trophy', color: '#ef4444' } },
  luogu: { originalIcon: 'fire', geometry: { source: 'fire', color: '#e76f51' } },
  'nowcoder-practice': { originalIcon: 'play', geometry: { source: 'play', color: '#22c55e' } },
  atcoder: { originalIcon: 'a', geometry: { source: 'a', color: '#0ea5e9' } },
  qoj: { originalIcon: 'puzzle', geometry: { source: 'puzzle', color: '#a855f7' } },
  'leetcode-cn': { originalIcon: 'briefcase', geometry: { source: 'briefcase', color: '#f59e0b' } },
  xcpcio: { originalIcon: 'bar-chart', geometry: { source: 'bar-chart', color: '#06b6d4' } },
  'acmer-info': { originalIcon: 'compass', geometry: { source: 'compass', color: '#7d5b78' } },
  yuantiji: { originalIcon: 'search', geometry: { source: 'search', color: '#10b981' } },
  algowiki: { originalIcon: 'library', geometry: { source: 'library', color: '#8b5cf6' } },
  cpcfinder: { originalIcon: 'map', geometry: { source: 'map', color: '#14b8a6' } },
  c16h22o4: { originalIcon: 'database', geometry: { source: 'database', color: '#f43f5e' } },
  github: { originalIcon: 'git', geometry: { source: 'git', color: '#162321' } },
  juejin: { originalIcon: 'message', geometry: { source: 'message', color: '#1e80ff' } },
  kaggle: { originalIcon: 'sparkles', geometry: { source: 'sparkles', color: '#20c997' } },
}

Object.values(OJ_ICON_REGISTRY).forEach((config) => {
  Object.freeze(config.geometry)
  Object.freeze(config)
})
Object.freeze(OJ_ICON_REGISTRY)
