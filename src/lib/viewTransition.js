import { flushSync } from 'react-dom'

// Shared view-transition-name for "thumbnail grows into lightbox" morphs.
// Only one such morph runs at a time, so one name is enough (styles in index.css).
export const MORPH_NAME = 'photo-morph'

export function supportsMorph() {
  return (
    typeof document !== 'undefined' &&
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// Run a React state update inside a view transition. flushSync makes React
// commit before the browser takes the "after" snapshot.
export function morph(update) {
  const transition = document.startViewTransition(() => flushSync(update))
  // A transition is skipped when another one starts first (e.g. Esc pressed
  // mid-morph). The update still applies, so the rejection is only noise.
  transition.ready.catch(() => {})
  return transition
}

// Width / height of the image inside a clicked thumbnail, so the lightbox can
// reserve the right box before the full-size file has loaded.
export function ratioOf(container) {
  const img = container?.querySelector?.('img')
  return img?.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : null
}
