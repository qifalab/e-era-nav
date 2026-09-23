import { describe, expect, it } from 'vitest'
import { ojCategories, ojResourceCount, ojServices, ojServicesByCategory } from './ojResources'
import { ojs } from '../oj/OjData'

describe('统一刷题资源目录', () => {
  it('从唯一内容源派生分类，保留两份旧目录的全部目标', () => {
    expect(ojResourceCount).toBe(28)
    expect(ojServices.map(item => item.url)).toEqual(ojs.map(item => item.url))
    expect(ojCategories.map(category => ojServicesByCategory[category.slug].length)).toEqual([7, 8, 9, 3, 1])
    expect(new Set(ojs.map(item => item.slug)).size).toBe(ojs.length)
    expect(new Set(ojs.map(item => new URL(item.url).href)).size).toBe(ojs.length)
    for (const slug of ['emoera-portal', 'xcpcio', 'yuantiji', 'c16h22o4']) expect(ojs.some(item => item.slug === slug)).toBe(true)
  })
  it('保留原有 HTTP 例外，不添加脚本地址', () => {
    expect(ojs.find(item => item.slug === 'poj').url).toBe('http://poj.org/')
    expect(ojs.filter(item => !item.url.startsWith('https://')).map(item => item.slug)).toEqual(['poj'])
    ojs.forEach(item => {
      expect(['https:', 'http:']).toContain(new URL(item.url).protocol)
      expect(item.name).toBeTruthy()
      expect(item.description).toBeTruthy()
      expect(ojCategories.some(category => category.slug === item.category)).toBe(true)
    })
  })
})
