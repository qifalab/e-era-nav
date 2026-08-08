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
    description: '统一身份认证与单点登录中心，支持多端同步、权限分级与第三方应用一键接入',
    url: 'https://account.emoera.com/',
    icon: 'lock',
    tags: ['单点登录', '账号', '基础设施'],
    badge: 'core',
    position: [-6.4, 0.75, 6.4],
  },
  {
    slug: 'era-ide',
    category: 'products',
    name: 'E时代IDE',
    description: '浏览器即开即用的云端开发环境，内置 AI 代码补全、实时协作与一键部署',
    url: 'https://ide.emoera.com/',
    icon: 'code',
    tags: ['云端开发', 'AI 补全', '协作'],
    badge: 'core',
    position: [-6.4, 0.75, 8.8],
  },
  {
    slug: 'era-cloud',
    category: 'products',
    name: 'E时代云服务',
    description: '弹性云端数据存储与计算平台，按需扩容、稳定可靠，支持多区域容灾备份',
    url: 'https://cloud.emoera.com/',
    icon: 'cloud',
    tags: ['存储', '计算', '弹性扩容'],
    position: [-6.4, 0.75, 4],
  },
  {
    slug: 'era-trust',
    category: 'products',
    name: 'E时代信任中心',
    description: '安全可信的认证与合规审计平台，为账号体系与数字资产提供全链路保护',
    url: 'https://trust.emoera.com/',
    icon: 'shield',
    tags: ['安全', '合规审计', '认证'],
    position: [-8.8, 0.75, 6.4],
  },
  {
    slug: 'era-lottery',
    category: 'products',
    name: 'E时代抽奖',
    description: '智能随机抽取与活动运营系统，支持多种抽奖模式、实时公示与中奖核销',
    url: 'https://choujiang.emoera.com/',
    icon: 'globe',
    tags: ['活动运营', '随机抽取', '公示'],
    position: [-4, 0.75, 6.4],
  },
  {
    slug: 'era-id',
    category: 'products',
    name: 'E时代ID',
    description: '社团成员统一数字身份卡，扫码即得个人主页、活动记录与作品集展示',
    url: 'https://neweid.emoera.com/',
    icon: 'id-card',
    tags: ['数字身份', '作品集', '扫码'],
    position: [-8.8, 0.75, 8.8],
  },
  {
    slug: 'era-clipboard',
    category: 'ecosystem',
    name: 'E时代云剪贴板',
    description: '代码、文本与文件的临时分享空间，支持权限控制与一键复制，协作更便捷',
    url: 'https://code.emoera.cn/',
    icon: 'clipboard',
    tags: ['临时分享', '代码片段', '协作'],
    badge: 'passport',
    position: [6.4, 0.75, 8.8],
  },
  {
    slug: 'era-registration',
    category: 'ecosystem',
    name: 'E时代比赛报名系统',
    description: '竞赛活动一站式报名与审核平台，支持表单填报、名单管理与通知推送',
    url: 'https://acm.emoera.cn/',
    icon: 'check-orbit',
    tags: ['竞赛报名', '表单', '通知'],
    badge: 'passport',
    position: [6.4, 0.75, 6.4],
  },
  {
    slug: 'era-image-host',
    category: 'ecosystem',
    name: 'E时代图床',
    description: '稳定高效的图片托管服务，支持外链分享与多格式上传，让内容传播更顺滑',
    url: 'https://image.emoera.cn/',
    icon: 'image',
    tags: ['图片托管', '外链', '多格式'],
    badge: 'passport',
    position: [6.4, 0.75, 4],
  },
  {
    slug: 'era-forum',
    category: 'ecosystem',
    name: 'E时代论坛',
    description: '技术交流与知识分享的社区平台，汇聚问答、教程与项目经验',
    url: 'https://ideawit.com/',
    icon: 'message',
    tags: ['社区', '问答', '教程'],
    badge: 'passport',
    position: [4, 0.75, 6.4],
  },
  {
    slug: 'era-git',
    category: 'ecosystem',
    name: 'E时代Git',
    description: '社团自托管的代码仓库与协作平台，支持版本控制、CI 流水线与团队协同',
    url: 'https://git.emoera.com/explore/repos',
    icon: 'git',
    tags: ['代码仓库', '版本控制', 'CI'],
    badge: 'passport',
    position: [8.8, 0.75, 6.4],
  },
  {
    slug: 'acm-team',
    category: 'team',
    name: 'ACM算法团队',
    description: 'E时代 ACM 算法竞赛团队主页，展示成员风采、训练计划与竞赛成果',
    url: 'https://acm.emoera.com/',
    icon: 'monitor',
    tags: ['算法竞赛', '团队', '训练'],
    position: [6.4, 0.75, -6.4],
  },
  {
    slug: 'era-team',
    category: 'team',
    name: 'E时代团队',
    description: 'E时代社团官方团队展示页，了解组织架构、招新信息与品牌故事',
    url: 'https://we.emoera.com/',
    icon: 'users',
    tags: ['官网', '招新', '组织架构'],
    position: [4, 0.75, -6.4],
  },
  {
    slug: 'era-developer',
    category: 'team',
    name: 'E时代 Developer',
    description: '面向开发者的资源与接入中心，提供 API 文档、SDK 与技术支持入口',
    url: 'https://developer.emoera.com/',
    icon: 'globe',
    tags: ['API 文档', 'SDK', '开发者'],
    position: [8.8, 0.75, -6.4],
  },
  {
    slug: 'miaoji-lab',
    category: 'team',
    name: '妙计实验室',
    description: '聚焦前沿技术与算法研究的创新实验室，孵化社团内部技术项目',
    url: 'https://home.miaojilab.cn/',
    icon: 'bulb',
    tags: ['实验室', '前沿技术', '孵化'],
    position: [6.4, 0.75, -4],
  },
  {
    slug: 'era-oj',
    category: 'team',
    name: 'E时代OJ',
    description: '在线编程练习与算法训练平台，支持题库、比赛与能力测评',
    url: 'https://oj.emoera.com/',
    icon: 'terminal',
    tags: ['在线评测', '题库', '算法'],
    position: [6.4, 0.75, -8.8],
  },
  {
    slug: 'qifa-lab',
    category: 'team',
    name: '启发实验室',
    description: 'E时代企业级研发实验室，输出可落地的工程方案与开源项目',
    url: 'https://www.qifalab.cn/qifalab-v1/',
    icon: 'flask',
    tags: ['企业研发', '开源', '工程方案'],
    position: [8.8, 0.75, -8.8],
  },
  {
    slug: 'duya-note',
    category: 'members',
    name: '渡鸦笔记',
    description: '个人知识管理与笔记分享平台，沉淀学习心得、技术文章与项目记录',
    url: 'https://www.duya.website/',
    icon: 'book',
    tags: ['笔记', '知识管理', '成员作品'],
    position: [-6.4, 0.75, -6.4],
  },
]

export const badgeLabels = {
  core: '核心服务',
  passport: '已接入通行证',
}

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

export const siteStats = {
  services: services.length,
  categories: categories.length,
  passport: services.filter((service) => service.badge === 'passport').length,
  domains: new Set(services.map((service) => new URL(service.url).hostname)).size,
}

export const onboardingSteps = [
  {
    step: '01',
    slug: 'era-passport',
    title: '开通通行证',
    detail: '一个账号打通社团所有服务，先在通行证中心完成注册与实名绑定。',
  },
  {
    step: '02',
    slug: 'era-ide',
    title: '打开云端 IDE',
    detail: '不用配置本地环境，浏览器直接写代码，随时保存与协作。',
  },
  {
    step: '03',
    slug: 'era-git',
    title: '提交你的项目',
    detail: '把作品推到社团 Git，进入成员项目区展示，让更多人看到。',
  },
]

