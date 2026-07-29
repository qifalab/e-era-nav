export const categories = [
  {
    slug: 'members',
    name: 'E时代社团成员项目',
    shortName: '成员项目',
    description: '社团成员个人项目与作品展示',
    accent: '#4f8fc9',
    glow: '#8ab8e8',
    position: [-6.4, 0, -6.4],
    camera: [-6.4, 6.8, -4],
  },
  {
    slug: 'products',
    name: '产品服务',
    shortName: '产品服务',
    description: 'E时代社团产品与基础服务',
    accent: '#2f7f78',
    glow: '#79c9bd',
    position: [-6.4, 0, 6.4],
    camera: [-6.4, 6.8, 14],
  },
  {
    slug: 'ecosystem',
    name: '通行证生态链',
    shortName: '通行证生态',
    description: '已接入 E时代通行证的一键登录产品',
    accent: '#b77b2f',
    glow: '#e9bd72',
    position: [6.4, 0, 6.4],
    camera: [6.4, 6.6, 14],
  },
  {
    slug: 'team',
    name: '团队与官网',
    shortName: '团队与官网',
    description: '社团团队、实验室与开发入口',
    accent: '#7d5b78',
    glow: '#c7a2c0',
    position: [6.4, 0, -6.4],
    camera: [6.4, 6.8, -4],
  },
]

export const services = [
  {
    slug: 'era-passport',
    category: 'products',
    name: 'E时代通行证',
    description: '统一身份认证与安全管理平台',
    url: 'https://account.emoera.com/',
    icon: 'lock',
    position: [-6.4, 0.75, 6.4],
  },
  {
    slug: 'era-ide',
    category: 'products',
    name: 'E时代IDE',
    description: '高效智能的云端开发环境',
    url: 'https://ide.emoera.com/',
    icon: 'code',
    position: [-6.4, 0.75, 8.8],
  },
  {
    slug: 'era-cloud',
    category: 'products',
    name: 'E时代云服务',
    description: '高性能云端数据存储与计算',
    url: 'https://cloud.emoera.com/',
    icon: 'cloud',
    position: [-6.4, 0.75, 4],
  },
  {
    slug: 'era-trust',
    category: 'products',
    name: 'E时代信任中心',
    description: '安全可信的认证体系，为您的数字信息保驾护航',
    url: 'https://trust.emoera.com/',
    icon: 'shield',
    position: [-8.8, 0.75, 6.4],
  },
  {
    slug: 'era-lottery',
    category: 'products',
    name: 'E时代抽奖',
    description: '智能随机抽取与活动管理系统',
    url: 'https://choujiang.emoera.com/',
    icon: 'globe',
    position: [-4, 0.75, 6.4],
  },
  {
    slug: 'era-id',
    category: 'products',
    name: 'E时代ID',
    description: '社团内部的身份卡系统',
    url: 'https://neweid.emoera.com/',
    icon: 'id-card',
    position: [-8.8, 0.75, 8.8],
  },
  {
    slug: 'era-clipboard',
    category: 'ecosystem',
    name: 'E时代云剪贴板',
    description: '快速分享，支持代码/文件分享与权限控制，让分享更简单',
    url: 'https://code.emoera.cn/',
    icon: 'clipboard',
    position: [6.4, 0.75, 8.8],
  },
  {
    slug: 'era-registration',
    category: 'ecosystem',
    name: 'E时代比赛报名系统',
    description: '便捷的竞赛活动报名与管理平台',
    url: 'https://acm.emoera.cn/',
    icon: 'check-orbit',
    position: [6.4, 0.75, 6.4],
  },
  {
    slug: 'era-image-host',
    category: 'ecosystem',
    name: 'E时代图床',
    description: '高效稳定的图片托管服务，快速上传与分享',
    url: 'https://image.emoera.cn/',
    icon: 'image',
    position: [6.4, 0.75, 4],
  },
  {
    slug: 'era-forum',
    category: 'ecosystem',
    name: 'E时代论坛',
    description: '技术交流与知识分享的社区平台',
    url: 'https://ideawit.com/',
    icon: 'message',
    position: [4, 0.75, 6.4],
  },
  {
    slug: 'era-git',
    category: 'ecosystem',
    name: 'E时代Git',
    description: '代码托管与协作平台',
    url: 'https://git.emoera.com/explore/repos',
    icon: 'git',
    position: [8.8, 0.75, 6.4],
  },
  {
    slug: 'acm-team',
    category: 'team',
    name: 'ACM算法团队',
    description: 'E时代ACM算法竞赛团队介绍与成员展示',
    url: 'https://acm.emoera.com/',
    icon: 'monitor',
    position: [6.4, 0.75, -6.4],
  },
  {
    slug: 'era-team',
    category: 'team',
    name: 'E时代团队',
    description: '全校最强编程类社团的团队展示页面',
    url: 'https://we.emoera.com/',
    icon: 'users',
    position: [4, 0.75, -6.4],
  },
  {
    slug: 'era-developer',
    category: 'team',
    name: 'E时代 Developer',
    description: 'E时代开发者平台与资源入口',
    url: 'https://developer.emoera.com/',
    icon: 'globe',
    position: [8.8, 0.75, -6.4],
  },
  {
    slug: 'miaoji-lab',
    category: 'team',
    name: '妙计实验室',
    description: '前沿技术与算法研究，推动技术创新升级',
    url: 'https://home.miaojilab.cn/',
    icon: 'bulb',
    position: [6.4, 0.75, -4],
  },
  {
    slug: 'era-oj',
    category: 'team',
    name: 'E时代OJ',
    description: '在线编程练习平台，提升算法与编程能力',
    url: 'https://oj.emoera.com/',
    icon: 'terminal',
    position: [6.4, 0.75, -8.8],
  },
  {
    slug: 'qifa-lab',
    category: 'team',
    name: '启发实验室',
    description: 'E时代研发中心，专注企业级解决方案',
    url: 'https://www.qifalab.cn/qifalab-v1/',
    icon: 'flask',
    position: [8.8, 0.75, -8.8],
  },
  {
    slug: 'duya-note',
    category: 'members',
    name: '渡鸦笔记',
    description: '个人知识管理与笔记分享平台',
    url: 'https://www.duya.website/',
    icon: 'book',
    position: [-6.4, 0.75, -6.4],
  },
]

function createSafeRecord(entries) {
  const record = Object.create(null)
  entries.forEach(([key, value]) => {
    record[key] = value
  })
  return record
}

export const categoryBySlug = createSafeRecord(
  categories.map((category) => [category.slug, category]),
)
export const serviceBySlug = createSafeRecord(
  services.map((service) => [service.slug, service]),
)
export const servicesByCategory = createSafeRecord(
  categories.map((category) => [
    category.slug,
    services.filter((service) => service.category === category.slug),
  ]),
)

export const overviewCamera = {
  position: [0, 14, 20],
  target: [0, 0, 0],
}
