import { describe, expect, it } from 'vitest'
import { categories, services } from './services'

const expectedUrls = {
  'era-passport': 'https://account.emoera.com/',
  'era-ide': 'https://ide.emoera.com/',
  'era-cloud': 'https://cloud.emoera.com/',
  'era-trust': 'https://trust.emoera.com/',
  'era-lottery': 'https://choujiang.emoera.com/',
  'era-id': 'https://neweid.emoera.com/',
  'era-clipboard': 'https://code.emoera.cn/',
  'era-registration': 'https://acm.emoera.cn/',
  'era-image-host': 'https://image.emoera.cn/',
  'era-forum': 'https://ideawit.com/',
  'era-git': 'https://git.emoera.com/explore/repos',
  'acm-team': 'https://acm.emoera.com/',
  'era-team': 'https://we.emoera.com/',
  'era-developer': 'https://developer.emoera.com/',
  'miaoji-lab': 'https://home.miaojilab.cn/',
  'era-oj': 'https://oj.emoera.com/',
  'qifa-lab': 'https://www.qifalab.cn/qifalab-v1/',
  'duya-note': 'https://www.duya.website/',
}

describe('service catalog', () => {
  it('preserves all 18 services in four regions', () => {
    expect(categories).toHaveLength(4)
    expect(services).toHaveLength(18)
    expect(
      categories.map((category) => services.filter((service) => service.category === category.slug).length),
    ).toEqual([1, 6, 5, 6])
  })

  it('uses unique stable slugs and HTTPS destinations', () => {
    expect(new Set(services.map((service) => service.slug)).size).toBe(18)
    services.forEach((service) => {
      expect(service.url).toMatch(/^https:\/\//)
      expect(service.name).toBeTruthy()
      expect(service.description).toBeTruthy()
      expect(service.position).toHaveLength(3)
    })
  })

  it('retains the current remote-master destinations', () => {
    expect(
      Object.fromEntries(services.map(({ slug, url }) => [slug, url])),
    ).toEqual(
      expectedUrls,
    )
  })
})
