// Compatibility exports derive from the single catalog; no second resource list.
import { categories, ojs } from '../oj/OjData'

const iconByCategory = { info: 'globe', learn: 'book-open', platform: 'code', contest: 'trophy', dev: 'git' }
export const ojCategories = categories.filter(item => item.id !== 'all').map(item => ({
  ...item, slug: item.id, shortName: item.name,
}))
export const ojServices = ojs.map(item => ({ ...item, icon: iconByCategory[item.category] }))
export const ojResourceCount = ojServices.length
export const ojCategoryBySlug = Object.assign(Object.create(null), Object.fromEntries(ojCategories.map(item => [item.slug, item])))
export const ojServiceBySlug = Object.assign(Object.create(null), Object.fromEntries(ojServices.map(item => [item.slug, item])))
export const ojServicesByCategory = Object.fromEntries(ojCategories.map(category => [category.slug, ojServices.filter(item => item.category === category.slug)]))
