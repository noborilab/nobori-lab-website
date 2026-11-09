import { useSyncExternalStore } from 'react'

// Hidden option: the hero cell field is off unless a visitor turns it on from
// the search palette (search "cells"). The choice is remembered per browser.
const KEY = 'nobori-cell-field'
const EVENT = 'cell-field-change'

let current = null // read from localStorage on first use

function read() {
  if (current === null) {
    try {
      current = localStorage.getItem(KEY) === 'on'
    } catch {
      current = false
    }
  }
  return current
}

function subscribe(onChange) {
  const onStorage = (e) => {
    if (e.key !== KEY) return
    current = null
    onChange()
  }
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function setCellField(on) {
  current = on
  try {
    if (on) localStorage.setItem(KEY, 'on')
    else localStorage.removeItem(KEY)
  } catch {
    // Storage blocked: the choice still applies until the page is reloaded.
  }
  window.dispatchEvent(new Event(EVENT))
}

// Off at build time (prerender), so the static HTML never contains the canvas.
export function useCellField() {
  return useSyncExternalStore(subscribe, read, () => false)
}
