// Pointer-following highlight for cards: add the `spotlight` class (index.css)
// and spread these props. Only the two CSS variables change on move, so there
// is no React re-render.
export const spotlightProps = {
  onPointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
  },
}
