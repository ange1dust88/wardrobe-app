import { getItemImageSrc, type Item } from '@/lib/items'

export function flyToHidden(fromRect: DOMRect, item: Item) {
  if (typeof document === 'undefined') return
  const targetEl = document.querySelector('[data-hidden-toggle]')
  if (!targetEl) return
  const target = targetEl.getBoundingClientRect()

  const ghost = document.createElement('div')
  ghost.style.position = 'fixed'
  ghost.style.left = `${fromRect.left}px`
  ghost.style.top = `${fromRect.top}px`
  ghost.style.width = `${fromRect.width}px`
  ghost.style.height = `${fromRect.height}px`
  ghost.style.borderRadius = '14px'
  ghost.style.overflow = 'hidden'
  ghost.style.zIndex = '60'
  ghost.style.pointerEvents = 'none'
  ghost.style.boxShadow = '0 8px 24px rgba(20,28,36,0.24)'
  ghost.style.background = item.color.hex
  const img = getItemImageSrc(item)
  if (img) {
    ghost.style.backgroundImage = `url(${img})`
    ghost.style.backgroundSize = 'cover'
    ghost.style.backgroundPosition = 'center'
  }
  document.body.appendChild(ghost)

  const dx =
    target.left + target.width / 2 - (fromRect.left + fromRect.width / 2)
  const dy =
    target.top + target.height / 2 - (fromRect.top + fromRect.height / 2)

  const anim = ghost.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.1 },
    ],
    { duration: 420, easing: 'cubic-bezier(0.4, 0.1, 0.7, 0.5)' }
  )
  anim.onfinish = () => ghost.remove()
  anim.oncancel = () => ghost.remove()
}
