import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

// A faint field of cells behind the hero. Cells near the pointer switch state
// (sage, coral at the core) and a click, tap or the occasional spontaneous
// event sends a wave of activation through the neighbours.
// Plain 2D canvas, no dependencies; it only animates while something is active
// and the hero is on screen, and stays a static dot field for reduced motion.

const INK = '28,30,34'
const SAGE = [107, 143, 107]
const CORAL = [200, 90, 58]
const IDLE_ALPHA = 0.13

const WAVE_SPEED = 210 // px per second
const WAVE_BAND = 44 // px, thickness of the travelling front
const WAVE_REACH = 380 // px, distance over which a wave fades
const POINTER_RADIUS = 95 // px

// Deterministic jitter so the field does not reshuffle on every resize.
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export default function CellField() {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const section = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!section || !ctx) return

    const idle = document.createElement('canvas')
    const idleCtx = idle.getContext('2d')

    let width = 0
    let height = 0
    let dpr = 1
    let count = 0
    let xs, ys, rs, vis, act
    let waves = []
    const pointer = { x: 0, y: 0, active: false }
    let visible = true
    let frame = 0
    let last = 0
    let ambientTimer = 0

    // Keep the logo and text clear: cells fade out towards the content column.
    function contentBox() {
      const base = section.getBoundingClientRect()
      let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity
      for (const el of section.children) {
        if (el === canvas || getComputedStyle(el).position === 'absolute') continue
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) continue
        left = Math.min(left, r.left - base.left)
        top = Math.min(top, r.top - base.top)
        right = Math.max(right, r.right - base.left)
        bottom = Math.max(bottom, r.bottom - base.top)
      }
      return left === Infinity ? null : { left, top, right, bottom }
    }

    // The fixed navbar is transparent over the hero; keep cells out from under it.
    function navHeight() {
      const nav = document.querySelector('nav')
      return nav && getComputedStyle(nav).position === 'fixed' ? nav.offsetHeight : 0
    }

    function layout() {
      width = section.clientWidth
      height = section.clientHeight
      if (!width || !height) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      for (const c of [canvas, idle]) {
        c.width = Math.round(width * dpr)
        c.height = Math.round(height * dpr)
      }

      const gap = width < 640 ? 30 : 36
      const rowGap = gap * 0.866
      const cols = Math.ceil(width / gap) + 2
      const rows = Math.ceil(height / rowGap) + 2
      const max = cols * rows
      xs = new Float32Array(max)
      ys = new Float32Array(max)
      rs = new Float32Array(max)
      vis = new Float32Array(max)
      act = new Float32Array(max)

      const box = contentBox()
      const navBottom = navHeight()
      const fade = width < 640 ? 70 : 150
      const rand = mulberry32(20240901)
      count = 0
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = (col - 0.5 + (row % 2) * 0.5) * gap + (rand() - 0.5) * gap * 0.55
          const y = (row - 0.5) * rowGap + (rand() - 0.5) * gap * 0.55
          const r = 1.1 + rand() * 0.9
          let v = 1
          if (box) {
            const dx = Math.max(box.left - x, 0, x - box.right)
            const dy = Math.max(box.top - y, 0, y - box.bottom)
            v = smoothstep(12, fade, Math.hypot(dx, dy))
          }
          // Dissolve into the next section rather than ending on a hard edge.
          v *= smoothstep(0, 140, height - y) * smoothstep(navBottom, navBottom + 40, y)
          if (v < 0.02) continue
          xs[count] = x
          ys[count] = y
          rs[count] = r
          vis[count] = v
          count++
        }
      }

      idleCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      idleCtx.clearRect(0, 0, width, height)
      for (let i = 0; i < count; i++) {
        idleCtx.fillStyle = `rgba(${INK},${(IDLE_ALPHA * vis[i]).toFixed(3)})`
        idleCtx.beginPath()
        idleCtx.arc(xs[i], ys[i], rs[i], 0, Math.PI * 2)
        idleCtx.fill()
      }
      drawIdle()
    }

    function drawIdle() {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(idle, 0, 0)
    }

    function tick(now) {
      frame = 0
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
      last = now
      const rise = 1 - Math.exp(-dt * 20)
      const decay = 1 - Math.exp(-dt * 2.4)

      for (const w of waves) w.radius += WAVE_SPEED * dt
      waves = waves.filter((w) => w.radius < WAVE_REACH * 2.2)

      drawIdle()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      let busy = pointer.active || waves.length > 0
      for (let i = 0; i < count; i++) {
        const x = xs[i]
        const y = ys[i]
        let target = 0
        if (pointer.active) {
          const d = Math.hypot(x - pointer.x, y - pointer.y)
          if (d < POINTER_RADIUS * 2.2) target = 0.95 * Math.exp(-((d / POINTER_RADIUS) ** 2))
        }
        for (const w of waves) {
          const d = Math.hypot(x - w.x, y - w.y)
          const off = (d - w.radius) / WAVE_BAND
          if (off > -2.5 && off < 2.5) {
            const t = w.power * Math.exp(-w.radius / WAVE_REACH) * Math.exp(-off * off)
            if (t > target) target = t
          }
        }
        let a = act[i]
        a += (target - a) * (target > a ? rise : decay)
        act[i] = a
        if (a < 0.015) continue
        busy = true

        // idle grey → sage → coral at the most strongly activated core
        const toSage = smoothstep(0, 0.35, a)
        const toCoral = smoothstep(0.55, 0.9, a)
        const cr = Math.round(SAGE[0] + (CORAL[0] - SAGE[0]) * toCoral)
        const cg = Math.round(SAGE[1] + (CORAL[1] - SAGE[1]) * toCoral)
        const cb = Math.round(SAGE[2] + (CORAL[2] - SAGE[2]) * toCoral)
        const v = vis[i]
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${((0.2 + 0.65 * a) * toSage * v).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(x, y, rs[i] * (1 + 1.1 * a), 0, Math.PI * 2)
        ctx.fill()
        // cell outline appears as the cell switches on
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(0.38 * a * v).toFixed(3)})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(x, y, rs[i] * 2.4 + 4 * a, 0, Math.PI * 2)
        ctx.stroke()
      }

      if (busy && visible) frame = requestAnimationFrame(tick)
    }

    function wake() {
      if (frame || !visible || document.hidden) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    function addWave(x, y, power) {
      if (waves.length > 5) waves.shift()
      waves.push({ x, y, radius: 0, power })
      wake()
    }

    function local(e) {
      const r = canvas.getBoundingClientRect()
      return [e.clientX - r.left, e.clientY - r.top]
    }

    function onMove(e) {
      if (e.pointerType === 'touch') return
      const [x, y] = local(e)
      pointer.x = x
      pointer.y = y
      pointer.active = true
      wake()
    }
    function onLeave() {
      pointer.active = false
    }
    function onDown(e) {
      const [x, y] = local(e)
      addWave(x, y, 1)
    }

    // An unprompted event now and then, so the field is alive without input.
    function scheduleAmbient(delay) {
      clearTimeout(ambientTimer)
      ambientTimer = setTimeout(() => {
        if (visible && !document.hidden && count) {
          let pick = 0
          for (let tries = 0; tries < 12; tries++) {
            pick = Math.floor(Math.random() * count)
            if (vis[pick] > 0.8) break
          }
          addWave(xs[pick], ys[pick], 0.8)
        }
        scheduleAmbient(6500 + Math.random() * 4500)
      }, delay)
    }

    layout()
    const resizeObserver = new ResizeObserver(() => {
      act?.fill(0)
      layout()
      if (waves.length || pointer.active) wake()
    })
    resizeObserver.observe(section)
    // Web fonts shift the text block; re-measure once they have loaded.
    document.fonts?.ready.then(layout).catch(() => {})

    if (reduced) return () => resizeObserver.disconnect()

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && (waves.length || pointer.active)) wake()
    })
    io.observe(section)
    section.addEventListener('pointermove', onMove, { passive: true })
    section.addEventListener('pointerleave', onLeave, { passive: true })
    section.addEventListener('pointerdown', onDown, { passive: true })
    scheduleAmbient(1600)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(ambientTimer)
      resizeObserver.disconnect()
      io.disconnect()
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
      section.removeEventListener('pointerdown', onDown)
    }
  }, [reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 -z-10 h-full w-full pointer-events-none"
    />
  )
}
