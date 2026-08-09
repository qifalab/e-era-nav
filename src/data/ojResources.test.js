import { describe, expect, it } from 'vitest'
import {
  ojCategories,
  ojResourceCount,
  ojServiceBySlug,
  ojServices,
  ojServicesByCategory,
} from './ojResources'
import { ALL_ICON_DEFINITIONS, getServiceIconConfig } from '../icons/originalIconRegistry'
import { OJ_ICON_REGISTRY } from '../icons/ojIconRegistry'
import { isSafeExternalUrl } from '../lib/navigation'

describe('OJ 副导航资源目录', () => {
  it('按五大分类组织且资源数量自洽', () => {
    expect(ojCategories).toHaveLength(5)
    expect(ojServices).toHaveLength(ojResourceCount)
    expect(
      ojCategories.map((category) => ojServicesByCategory[category.slug].length),
    ).toEqual([1, 4, 6, 6, 3])
    const total = ojCategories.reduce(
      (sum, category) => sum + ojServicesByCategory[category.slug].length,
      0,
    )
    expect(total).toBe(ojResourceCount)
  })

  it('使用唯一稳定 slug 且全部为 HTTPS 合法条目', () => {
    expect(new Set(ojServices.map((service) => service.slug)).size).toBe(ojResourceCount)
    ojServices.forEach((service) => {
      expect(service.url).toMatch(/^https:\/\//)
      expect(service.name).toBeTruthy()
      expect(service.description).toBeTruthy()
      expect(service.position).toHaveLength(3)
      expect(ojCategories.some((category) => category.slug === service.category)).toBe(true)
      expect(ojServiceBySlug[service.slug]).toBeDefined()
    })
  })

  it('每条资源都有可解析的图标与服务配置', () => {
    ojServices.forEach((service) => {
      // 卡片用 slug 查注册表；图标用 service.icon 渲染本地矢量。
      expect(getServiceIconConfig(service.slug)).not.toBeNull()
      expect(ALL_ICON_DEFINITIONS[service.icon]).toBeDefined()
    })
    expect(Object.keys(OJ_ICON_REGISTRY)).toHaveLength(ojResourceCount)
  })

  it('外链白名单能识别副导航目标地址', () => {
    expect(isSafeExternalUrl(ojServiceBySlug.codeforces.url, 'oj')).toBe(true)
    expect(isSafeExternalUrl(ojServiceBySlug.luogu.url, 'oj')).toBe(true)
    // 主导航的白名单不应放行 OJ 地址（命名空间隔离）。
    expect(isSafeExternalUrl(ojServiceBySlug.codeforces.url, 'main')).toBe(false)
  })
})
