"use client"

import { profile } from "@/data/data"
import { KineticText } from "@/components/animation/kinetic-text"
import { type ReactNode, useEffect, useRef } from "react"

const NAME = profile.displayName
const FONT_FAMILY = "Aspekta, sans-serif"

type Particle = {
  ox: number
  oy: number
  cy: number
  speed: number
  inText: boolean
  color: string
}

const particleColor = (nx: number, ny: number) => {
  const brightness = 0.4 + ny * 0.5 + nx * 0.1
  const rand = 0.6 + Math.random() * 0.4
  const b = brightness * rand
  const r = Math.round(b * 10)
  const g = Math.round(b * (140 + ny * 60 + nx * 30))
  const b2 = Math.round(b * (130 + ny * 40))
  return `rgb(${r},${g},${b2})`
}

const font = (size: number) => `500 ${size}px ${FONT_FAMILY}`

const canvasHeightRatio = (width: number) => {
  if (width >= 1024) return 0.3
  if (width >= 768) return 5 / 14
  return 0.4
}

const fitFont = (
  measureCtx: CanvasRenderingContext2D,
  height: number,
  width: number
) => {
  const pad = 32
  let size = Math.round(height * 0.82)
  measureCtx.font = font(size)
  let textWidth = measureCtx.measureText(NAME).width
  while (textWidth > width - pad && size > 10) {
    size -= 2
    measureCtx.font = font(size)
    textWidth = measureCtx.measureText(NAME).width
  }
  return size
}

type FooterNameCanvasProps = Readonly<{
  children?: ReactNode
}>

export const FooterNameCanvas = ({ children }: FooterNameCanvasProps) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)")

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let isHovering = false
    let transitionP = 0
    let rafId = 0
    let looping = false
    let isVisible = true
    let resizeTimer = 0
    let retryTimer = 0
    let cancelled = false
    let useParticles = false
    const radius = 2.2
    const gap = 6

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = wrap.offsetWidth || window.innerWidth
      if (width === 0) return false
      height = Math.round(width * canvasHeightRatio(width))
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      return true
    }

    const buildParticles = () => {
      particles = []
      const off = document.createElement("canvas")
      off.width = width
      off.height = height
      const oc = off.getContext("2d")
      if (!oc) return

      const fontSize = fitFont(oc, height, width)
      const textX = width / 2
      const textY = height * 0.55
      oc.textBaseline = "middle"
      oc.textAlign = "center"
      oc.fillStyle = "#fff"
      oc.font = font(fontSize)
      oc.fillText(NAME, textX, textY)
      const data = oc.getImageData(0, 0, width, height).data

      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          particles.push({
            ox: x,
            oy: y,
            cy: y + Math.random() * height,
            speed: 0.3 + Math.random() * 0.5,
            inText: data[(y * width + x) * 4 + 3] > 128,
            color: particleColor(x / width, y / height),
          })
        }
      }
    }

    const paint = () => {
      ctx.clearRect(0, 0, width, height)
      if (!useParticles) return

      transitionP += ((isHovering ? 1 : 0) - transitionP) * 0.06

      for (const particle of particles) {
        if (particle.inText) continue
        if (transitionP > 0.01) {
          particle.cy -= particle.speed * transitionP
          if (particle.cy < -gap) particle.cy += height + gap
        }
        const vertFade = Math.max(0, Math.min(1, particle.cy / height))
        ctx.globalAlpha = transitionP * vertFade
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.ox, particle.cy, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    const loop = () => {
      if (document.hidden || !isVisible || !useParticles) {
        looping = false
        rafId = 0
        return
      }
      paint()
      // Idle: nothing is drawn while not hovered, so stop instead of clearing the
      // canvas and walking every particle each frame. onEnter restarts the loop.
      if (!isHovering && transitionP < 0.005) {
        transitionP = 0
        ctx.clearRect(0, 0, width, height)
        looping = false
        rafId = 0
        return
      }
      rafId = requestAnimationFrame(loop)
    }

    const ensureLoop = () => {
      if (looping || !useParticles) return
      looping = true
      rafId = requestAnimationFrame(loop)
    }

    const setup = () => {
      useParticles = hoverMq.matches && !motionMq.matches
      if (!sizeCanvas()) {
        retryTimer = window.setTimeout(() => {
          if (!cancelled) setup()
        }, 100)
        return
      }

      if (useParticles) {
        buildParticles()
        paint()
        ensureLoop()
      } else {
        particles = []
        ctx.clearRect(0, 0, width, height)
      }
    }

    const onEnter = () => {
      if (!useParticles) return
      isHovering = true
      ensureLoop()
    }

    const onLeave = () => {
      isHovering = false
    }

    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(setup, 200)
    }

    wrap.addEventListener("mouseenter", onEnter)
    wrap.addEventListener("mouseleave", onLeave)
    window.addEventListener("resize", onResize)

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible) ensureLoop()
      },
      { rootMargin: "80px" }
    )
    observer.observe(wrap)

    const onVisibility = () => {
      if (!document.hidden && isVisible) ensureLoop()
    }
    document.addEventListener("visibilitychange", onVisibility)

    void document.fonts.ready.then(() => {
      if (!cancelled) setup()
    })

    return () => {
      cancelled = true
      looping = false
      cancelAnimationFrame(rafId)
      window.clearTimeout(resizeTimer)
      window.clearTimeout(retryTimer)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibility)
      wrap.removeEventListener("mouseenter", onEnter)
      wrap.removeEventListener("mouseleave", onLeave)
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={wrapRef} className="relative aspect-5/2 w-full md:aspect-14/5 lg:aspect-10/3">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
      />
      <KineticText
        text={NAME}
        className="absolute inset-0 z-1 items-center justify-center px-3 text-[clamp(2.25rem,10.5vw,12.75rem)] leading-none text-background-2 max-lg:translate-y-[-12%] md:px-6"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-1 px-3 pb-6 text-center md:px-6 md:pb-8">
        {children}
      </div>
    </div>
  )
}
