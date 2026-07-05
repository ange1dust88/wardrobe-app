import { BASE_SUBTYPES, STACK_POLICY, type Item } from './items'

function layerKey(item: Item): string {
  const base = BASE_SUBTYPES[item.category]
  if (base) return base.includes(item.subType ?? '') ? 'base' : 'main'
  return item.subType ?? '__none'
}

export function toggleOutfitItem(selected: Item[], item: Item): Item[] {
  if (selected.some(s => s.id === item.id)) {
    return selected.filter(s => s.id !== item.id)
  }
  const policy = STACK_POLICY[item.category] ?? 'single'
  if (policy === 'unlimited') return [...selected, item]
  if (policy === 'layered') {
    const key = layerKey(item)
    return [
      ...selected.filter(
        s => !(s.category === item.category && layerKey(s) === key)
      ),
      item,
    ]
  }
  return [...selected.filter(s => s.category !== item.category), item]
}
