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

// 卡片增强用的元信息（标签 + 一句话介绍），与核心目录数据解耦，
// 不破坏 services 数组结构，也不影响字段校验测试。
export const serviceMeta = {
  'era-passport': {
    tags: ['身份认证', '安全', 'SSO'],
    intro: '社团统一账号体系，支持单点登录、权限管理与安全审计。',
  },
  'era-ide': {
    tags: ['云端', '开发'],
    intro: '浏览器内即可完成代码编写、运行与调试，随时随地开启开发。',
  },
  'era-cloud': {
    tags: ['存储', '计算'],
    intro: '面向社团项目的高可用对象存储与弹性计算资源入口。',
  },
  'era-trust': {
    tags: ['安全', '可信'],
    intro: '提供实名认证、可信凭证与数字身份风控能力。',
  },
  'era-lottery': {
    tags: ['活动', '抽奖'],
    intro: '为社团活动提供随机抽取、奖项配置与开奖公示的一站式方案。',
  },
  'era-id': {
    tags: ['身份', '卡片'],
    intro: '生成与管理社团成员专属身份卡，一卡通行各项服务。',
  },
  'era-clipboard': {
    tags: ['分享', '代码'],
    intro: '快速分享代码片段与文件，支持过期时间与访问权限控制。',
  },
  'era-registration': {
    tags: ['报名', '竞赛'],
    intro: '覆盖竞赛报名、组队审核与名单导出的全流程管理平台。',
  },
  'era-image-host': {
    tags: ['图床', '托管'],
    intro: '稳定托管活动图片与截图，支持外链与缩略图输出。',
  },
  'era-forum': {
    tags: ['社区', '交流'],
    intro: '围绕技术话题与社团事务的讨论、问答与知识沉淀社区。',
  },
  'era-git': {
    tags: ['代码', '协作'],
    intro: '社团代码仓库托管，支持版本控制、分支协作与 CI 集成。',
  },
  'acm-team': {
    tags: ['团队', '算法'],
    intro: 'ACM 算法竞赛战队的成员展示、题解汇总与训练入口。',
  },
  'era-team': {
    tags: ['团队', '社团'],
    intro: '展示社团历史、部门架构与招新信息的主页门户。',
  },
  'era-developer': {
    tags: ['开发者', '资源'],
    intro: '面向社团开发者的接口文档、SDK 与开放平台入口。',
  },
  'miaoji-lab': {
    tags: ['研究', '算法'],
    intro: '聚焦算法创新与工程实践的校内技术实验室。',
  },
  'era-oj': {
    tags: ['OJ', '算法', '练习'],
    intro: '在线评测题库与算法训练平台，支持多语言代码提交。',
  },
  'qifa-lab': {
    tags: ['研发', '企业'],
    intro: '承接企业级项目研发，沉淀工程化交付与技术创新能力。',
  },
  'duya-note': {
    tags: ['笔记', '知识'],
    intro: '个人知识库与笔记分享空间，记录学习与项目经验。',
  },
}
