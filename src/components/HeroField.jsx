import { useRef, useEffect } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

const ALPHA = 0.03
const MAX_SPEED = 0.22
const EDGE_DIST = 48
const PULL = 0.003

const CLUSTER_DEFS = [
  { cxF: 0.22, cyF: 0.38, n: 70, rxF: 0.12, ryF: 0.18 },
  { cxF: 0.62, cyF: 0.28, n: 55, rxF: 0.10, ryF: 0.14 },
  { cxF: 0.75, cyF: 0.68, n: 45, rxF: 0.09, ryF: 0.15 },
]

function makePoints(W, H) {
  const pts = []
  CLUSTER_DEFS.forEach((cl, ci) => {
    const cx = cl.cxF * W
    const cy = cl.cyF * H
    const rx = cl.rxF * W
    const ry = cl.ryF * H
    for (let i = 0; i < cl.n; i++) {
      const angle = Math.random() * Math.PI * 2
      const mag = Math.sqrt(Math.random()) // uniform disk sampling
      pts.push({
        x:  cx + mag * rx * Math.cos(angle),
        y:  cy + mag * ry * Math.sin(angle),
        hx: cx,
        hy: cy,
        vx: (Math.random() - 0.5) * MAX_SPEED,
        vy: (Math.random() - 0.5) * MAX_SPEED,
        r:  1.8 + Math.random() * 2.2,
        ci,
      })
    }
  })
  return pts
}

function stepPoints(pts) {
  for (const p of pts) {
    p.vx += (Math.random() - 0.5) * 0.06
    p.vy += (Math.random() - 0.5) * 0.06
    p.vx += (p.hx - p.x) * PULL
    p.vy += (p.hy - p.y) * PULL
    const speed = Math.hypot(p.vx, p.vy)
    if (speed > MAX_SPEED) {
      const inv = MAX_SPEED / speed
      p.vx *= inv
      p.vy *= inv
    }
    p.x += p.vx
    p.y += p.vy
  }
}

export default function HeroField() {
  const reduced = useReducedMotion()
  const canvasRef = useRef(null)

  useEffect(() => {
    if (reduced) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let pts = []
    let dpr = 1
    let W = 0
    let H = 0
    let visible = true
    let rafId = null
    let lastTime = 0

    function resize() {
      dpr = window.devicePixelRatio || 1
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width  = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      pts = makePoints(W, H)
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(dpr, dpr)

      // Edges — same cluster, within EDGE_DIST
      ctx.lineWidth = 0.4
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          if (pts[i].ci !== pts[j].ci) continue
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          if (Math.abs(dx) >= EDGE_DIST || Math.abs(dy) >= EDGE_DIST) continue
          const d = Math.hypot(dx, dy)
          if (d >= EDGE_DIST) continue
          ctx.strokeStyle = `rgba(107,143,107,${ALPHA * 0.55 * (1 - d / EDGE_DIST)})`
          ctx.beginPath()
          ctx.moveTo(pts[i].x, pts[i].y)
          ctx.lineTo(pts[j].x, pts[j].y)
          ctx.stroke()
        }
      }

      // Points
      ctx.fillStyle = `rgba(107,143,107,${ALPHA})`
      for (const p of pts) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    function loop(now) {
      if (!visible) { rafId = null; return }
      rafId = requestAnimationFrame(loop)
      if (now - lastTime < 33) return // 30 FPS cap
      lastTime = now
      stepPoints(pts)
      draw()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting
      if (visible && rafId === null) {
        lastTime = 0
        rafId = requestAnimationFrame(loop)
      }
    }, { threshold: 0 })
    io.observe(canvas)

    rafId = requestAnimationFrame(loop)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      ro.disconnect()
      io.disconnect()
    }
  }, [reduced])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    />
  )
}
