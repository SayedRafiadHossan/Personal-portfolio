"use client"

import { useEffect } from "react"

/*
 * TEMPORARY diagnostics — remove with app/api/perf-probe once the intro lag is solved.
 * Records slow frames during the first seconds after load and posts them to the
 * local server, which prints them in its log. Nothing leaves this machine.
 */

type Loaf = PerformanceEntry & {
  blockingDuration?: number
  renderStart?: number
  styleAndLayoutStart?: number
  scripts?: {
    duration: number
    invoker?: string
    sourceFunctionName?: string
    sourceURL?: string
    forcedStyleAndLayoutDuration?: number
  }[]
}

const RECORD_MS = 15000

export const PerfProbe = () => {
  useEffect(() => {
    const frames: unknown[] = []
    const gaps: { at: number; gap: number }[] = []

    let observer: PerformanceObserver | null = null
    try {
      observer = new PerformanceObserver((list) => {
        for (const e of list.getEntries() as Loaf[]) {
          if (e.duration < 34) continue
          const end = e.startTime + e.duration
          frames.push({
            at: Math.round(e.startTime),
            dur: Math.round(e.duration),
            blocking: Math.round(e.blockingDuration ?? 0),
            // time from style/layout to the end of the frame (layout + paint)
            layoutPaint: e.styleAndLayoutStart ? Math.round(end - e.styleAndLayoutStart) : 0,
            scripts: (e.scripts ?? [])
              .filter((s) => s.duration >= 5)
              .sort((a, b) => b.duration - a.duration)
              .slice(0, 3)
              .map((s) => ({
                ms: Math.round(s.duration),
                forcedLayout: Math.round(s.forcedStyleAndLayoutDuration ?? 0),
                by: s.invoker,
                fn: s.sourceFunctionName,
                file: s.sourceURL?.split("/").pop(),
              })),
          })
        }
      })
      observer.observe({ type: "long-animation-frame", buffered: true })
    } catch {
      /* long-animation-frame not supported: the rAF gaps below still work */
    }

    // Gaps between animation frames (also catches stalls with no long script)
    let last = performance.now()
    let raf = requestAnimationFrame(function tick(t) {
      const gap = t - last
      if (gap > 34) gaps.push({ at: Math.round(last), gap: Math.round(gap) })
      last = t
      raf = requestAnimationFrame(tick)
    })

    const timer = window.setTimeout(() => {
      cancelAnimationFrame(raf)
      observer?.disconnect()
      const marks = performance
        .getEntriesByType("mark")
        .filter((m) => m.name.startsWith("preloader:"))
        .map((m) => ({ name: m.name, at: Math.round(m.startTime) }))
      const report = {
        viewport: `${window.innerWidth}x${window.innerHeight}@${window.devicePixelRatio}`,
        visible: document.visibilityState,
        ua: navigator.userAgent.replace(/^.*?(Chrome|Firefox|Edg)\/([\d.]+).*$/, "$1/$2"),
        marks,
        frames,
        gaps,
      }
      void fetch("/api/perf-probe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(report),
        keepalive: true,
      }).catch(() => {})
    }, RECORD_MS)

    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
      observer?.disconnect()
    }
  }, [])

  return null
}
