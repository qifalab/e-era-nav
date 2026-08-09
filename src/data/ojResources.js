// 副导航数据：XCPC 竞赛 + 软件开发相关站点。
// 与 src/data/services.js 同构，保证 Directory / ServiceCardFace 可复用。

export const ojCategories = [
  {
    slug: 'oj-info',
    name: '信息门户',
    shortName: '信息门户',
    description: 'E时代官方频道与社团动态入口',
    accent: '#4f8fc9',
    glow: '#8ab8e8',
    position: [-6.4, 0, -6.4],
    camera: [-6.4, 6.8, -4],
  },
  {
    slug: 'oj-basics',
    name: '基础学习',
    shortName: '基础学习',
    description: '从零构建算法与竞赛知识体系',
    accent: '#2f7f78',
    glow: '#79c9bd',
    position: [-6.4, 0, 6.4],
    camera: [-6.4, 6.8, 14],
  },
  {
    slug: 'oj-practice',
    name: '刷题训练',
    shortName: '刷题训练',
    description: '面向 XCPC 与求职面试的高频刷题站',
    accent: '#b77b2f',
    glow: '#e9bd72',
    position: [6.4, 0, 6.4],
    camera: [6.4, 6.6, 14],
  },
  {
    slug: 'oj-contest',
    name: '竞赛资源拓展',
    shortName: '竞赛资源',
    description: '榜单、题库、选手数据与辅助查询',
    accent: '#7d5b78',
    glow: '#c7a2c0',
    position: [6.4, 0, -6.4],
    camera: [6.4, 6.8, -4],
  },
  {
    slug: 'oj-dev',
    name: '软件开发',
    shortName: '软件开发',
    description: '工程协作、技术社区与数据科学站点',
    accent: '#256a64',
    glow: '#5fb0a4',
    position: [0, 0, -10],
    camera: [0, 6.8, -8],
  },
]

export const ojServices = [
  {
    slug: 'emoera-portal',
    category: 'oj-info',
    name: 'E时代官网',
    description: '社团官方主页，了解 E时代文化与活动',
    url: 'https://www.emoera.com/',
    icon: 'globe',
    position: [0, 0.75, 0],
  },
  // 基础学习 ----------------------------------------------------------
  {
    slug: 'oi-wiki',
    category: 'oj-basics',
    name: 'OI Wiki',
    description: '砖竞赛系统知识手册，覆盖算法与编程竞赛全栈知识',
    url: 'https://oi-wiki.org/',
    icon: 'book-open',
    position: [-6.4, 0.75, 6.4],
  },
  {
    slug: 'acwing',
    category: 'oj-basics',
    name: 'AcWing',
    description: '早期热门学习平台，但更新迟滞，不推荐',
    url: 'https://www.acwing.com/',
    icon: 'graduation',
    position: [-6.4, 0.75, 4],
  },
  {
    slug: 'nowcoder-tracker',
    category: 'oj-basics',
    name: '牛客题库',
    description: '从 0 到 1 构建算法知识体系',
    url: 'https://www.nowcoder.com/problem/tracker',
    icon: 'route',
    position: [-6.4, 0.75, 8.8],
  },
  // 刷题训练 ----------------------------------------------------------
  {
    slug: 'codeforces',
    category: 'oj-practice',
    name: 'Codeforces',
    description: '最贴近 XCPC 方向，适合正式训练赛',
    url: 'https://codeforces.com/',
    icon: 'trophy',
    position: [6.4, 0.75, 8.8],
  },
  {
    slug: 'luogu',
    category: 'oj-practice',
    name: '洛谷',
    description: 'OI 界老牌刷题站，社区与题库都很完善',
    url: 'https://www.luogu.com.cn/',
    icon: 'fire',
    position: [6.4, 0.75, 6.4],
  },
  {
    slug: 'nowcoder-practice',
    category: 'oj-practice',
    name: '牛客练习',
    description: '新手入门友好，难度梯度平缓',
    url: 'https://www.nowcoder.com/',
    icon: 'play',
    position: [6.4, 0.75, 4],
  },
  {
    slug: 'atcoder',
    category: 'oj-practice',
    name: 'AtCoder',
    description: '日本 AC 热门的刷题平台，画风友好的英文日文题库',
    url: 'https://atcoder.jp/home',
    icon: 'a',
    position: [4, 0.75, 6.4],
  },
  {
    slug: 'qoj',
    category: 'oj-practice',
    name: 'QOJ',
    description: '国内大佬建立的题目信息分享平台',
    url: 'https://qoj.ac/',
    icon: 'puzzle',
    position: [8.8, 0.75, 6.4],
  },
  {
    slug: 'leetcode-cn',
    category: 'oj-practice',
    name: 'LeetCode 中国',
    description: '面向求职面试场景的刷题平台',
    url: 'https://leetcode.cn/',
    icon: 'briefcase',
    position: [8.8, 0.75, 8.8],
  },
  // 竞赛资源拓展 ------------------------------------------------------
  {
    slug: 'xcpcio',
    category: 'oj-contest',
    name: 'XCPCIO',
    description: 'XCPC 榜单查询，实时跟踪各大比赛成绩',
    url: 'https://xcpcio.com/zh/guide/',
    icon: 'bar-chart',
    position: [6.4, 0.75, -6.4],
  },
  {
    slug: 'acmer-info',
    category: 'oj-contest',
    name: 'Acmer.info',
    description: '致力于服务算法竞赛选手的导航站',
    url: 'https://acmer.info/',
    icon: 'compass',
    position: [4, 0.75, -6.4],
  },
  {
    slug: 'yuantiji',
    category: 'oj-contest',
    name: '源题姬',
    description: '搜索查询题目及涉及的其他相似题目',
    url: 'https://yuantiji.ac/',
    icon: 'search',
    position: [8.8, 0.75, -6.4],
  },
  {
    slug: 'algowiki',
    category: 'oj-contest',
    name: 'AlgoWiki',
    description: '算法常用信息：近期比赛、培训课程与赛事站点',
    url: 'https://www.algowiki.cn/',
    icon: 'library',
    position: [6.4, 0.75, -4],
  },
  {
    slug: 'cpcfinder',
    category: 'oj-contest',
    name: 'CPCFinder',
    description: 'XCPC 学校、选手信息一站式检索',
    url: 'https://cpcfinder.com/',
    icon: 'map',
    position: [6.4, 0.75, -8.8],
  },
  {
    slug: 'c16h22o4',
    category: 'oj-contest',
    name: 'c16h22o4',
    description: '蓝桥杯学校、选手信息查询站点',
    url: 'https://c16h22o4.github.io/',
    icon: 'database',
    position: [8.8, 0.75, -8.8],
  },
  // 软件开发 -----------------------------------------------------------
  {
    slug: 'github',
    category: 'oj-dev',
    name: 'GitHub',
    description: '程序员必备网站，托管开源项目与合作开发',
    url: 'https://github.com/',
    icon: 'git',
    position: [0, 0.75, -10],
  },
  {
    slug: 'juejin',
    category: 'oj-dev',
    name: '掘金',
    description: '程序员信息交流与技术分享社区',
    url: 'https://juejin.cn/',
    icon: 'message',
    position: [-2.4, 0.75, -10],
  },
  {
    slug: 'kaggle',
    category: 'oj-dev',
    name: 'Kaggle',
    description: '数据科学社区，竞赛、Notebook 与数据集',
    url: 'https://www.kaggle.com/',
    icon: 'sparkles',
    position: [2.4, 0.75, -10],
  },
]

function createSafeRecord(entries) {
  const record = Object.create(null)
  entries.forEach(([key, value]) => {
    record[key] = value
  })
  return record
}

export const ojCategoryBySlug = createSafeRecord(
  ojCategories.map((category) => [category.slug, category]),
)

export const ojServiceBySlug = createSafeRecord(
  ojServices.map((service) => [service.slug, service]),
)

export const ojServicesByCategory = createSafeRecord(
  ojCategories.map((category) => [
    category.slug,
    ojServices.filter((service) => service.category === category.slug),
  ]),
)

export const ojResourceCount = ojServices.length
