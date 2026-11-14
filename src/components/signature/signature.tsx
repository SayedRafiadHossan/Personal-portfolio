"use client"

import { cn } from "@/lib/utils"
import { SIGNATURE_OTF_PUBLIC_URL, fontSignature } from "@/utils/font"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { useEffect, useId, useRef, useState } from "react"

gsap.registerPlugin(useGSAP, DrawSVGPlugin)

export type SignatureProps = Readonly<{
  text?: string
  color?: string
  fontSize?: number
  duration?: number
  /**
   * Pen mode: write the whole text in this many seconds, like one continuous
   * stroke — each letter drawn at a steady pace, flowing into the next, with the
   * whole word easing in and out. Overrides `duration`'s per-letter timing.
   */
  writeIn?: number
  delay?: number
  className?: string
  onComplete?: () => void
  /** Called every frame while drawing, with 0–1 progress of the stroke. */
  onProgress?: (progress: number) => void
}>

export const Signature = ({
  text = "Signature",
  color = "#000000",
  fontSize = 14,
  duration = 2,
  writeIn,
  delay = 0,
  className,
  onComplete,
  onProgress,
}: SignatureProps) => {
  const maskId = useId().replaceAll(":", "")
  const rootRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const maskPathRefs = useRef<(SVGPathElement | null)[]>([])
  const onDone = useRef(onComplete)
  const onTick = useRef(onProgress)

  useEffect(() => {
    onDone.current = onComplete
    onTick.current = onProgress
  }, [onComplete, onProgress])

  const [paths, setPaths] = useState<string[]>([])
  const [width, setWidth] = useState(300)
  const [fontReady, setFontReady] = useState(false)

  const horizontalPadding = fontSize * 0.1
  const height = Math.max(120, Math.ceil(fontSize * 2.4))
  const topMargin = Math.max(8, (height - fontSize) / 2)
  const baseline = Math.min(height - 8, topMargin + fontSize * 0.92)

  /** Mask stroke thickness — wider reveals solid fill cleanly (same idea as Motion sample). */
  const maskStroke = Math.max(fontSize * 0.18, 4)

  useEffect(() => {
    let cancelled = false

    async function load() {
      // Load the parser and the font file at the same time, not one after the other
      // (the file is also preloaded from the layout, so this usually hits the cache).
      const fontFile = fetch(SIGNATURE_OTF_PUBLIC_URL)
        .then((res) => (res.ok ? res.arrayBuffer() : null))
        .catch(() => null)
      const opentype = (await import("opentype.js")).default
      let font = null

      try {
        const buf = await fontFile
        if (buf) font = opentype.parse(buf)
      } catch {
        /* fall through */
      }

      if (!font) {
        const urls = [
          SIGNATURE_OTF_PUBLIC_URL,
          `${globalThis.location.origin}${SIGNATURE_OTF_PUBLIC_URL}`,
        ]
        for (const url of urls) {
          try {
            font = await opentype.load(url)
            break
          } catch {
            /* next */
          }
        }
      }

      if (cancelled) return

      if (!font) {
        setPaths([])
        setWidth(text.length * fontSize * 0.65)
        setFontReady(true)
        return
      }

      let x = horizontalPadding
      const next: string[] = []
      for (const char of text) {
        const glyph = font.charToGlyph(char)
        const pathObj = glyph.getPath(x, baseline, fontSize)
        next.push(pathObj.toPathData(3))
        const advance = glyph.advanceWidth ?? font.unitsPerEm
        x += advance * (fontSize / font.unitsPerEm)
      }
      setPaths(next)
      setWidth(Math.ceil(x + horizontalPadding))
      setFontReady(true)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [text, fontSize, baseline, horizontalPadding])

  useEffect(() => {
    if (!fontReady || paths.length > 0) return
    const id = globalThis.setTimeout(() => onDone.current?.(), 1500)
    return () => globalThis.clearTimeout(id)
  }, [fontReady, paths.length])

  useGSAP(
    () => {
      if (paths.length === 0) return

      let cancelled = false
      const raf = requestAnimationFrame(() => {
        if (cancelled) return
        const svg = svgRef.current
        if (!svg) return

        const maskStrokes = paths
          .map((_, i) => maskPathRefs.current[i])
          .filter((n): n is SVGPathElement => n !== null)
        if (maskStrokes.length !== paths.length) return

        gsap.set(maskStrokes, { drawSVG: 0 })
        for (const el of maskStrokes) {
          el.dataset.maskReady = "true"
        }

        gsap.fromTo(
          svg,
          { opacity: 0.85 },
          { opacity: 1, duration: 0.35, ease: "power2.out" }
        )

        if (writeIn) {
          // Pen mode: letters drawn back to back at a linear pace (slight overlap so
          // the pen never stops), then the whole run is played through one ease.
          const step = 1
          const pen = gsap.timeline({ paused: true })
          pen.to(maskStrokes, {
            drawSVG: "100%",
            duration: step,
            ease: "none",
            stagger: step * 0.55,
          })
          gsap.to(pen, {
            progress: 1,
            duration: writeIn,
            delay,
            ease: "power1.inOut",
            onUpdate: () => onTick.current?.(pen.progress()),
            onComplete: () => onDone.current?.(),
          })
          return
        }

        const tl = gsap.timeline({
          onUpdate: () => onTick.current?.(tl.progress()),
          onComplete: () => onDone.current?.(),
        })
        tl.to(
          maskStrokes,
          {
            drawSVG: "100%",
            duration,
            stagger: { each: 0.16, from: "start" },
            ease: "power2.out",
            delay,
          },
          0
        )
      })

      return () => {
        cancelled = true
        cancelAnimationFrame(raf)
      }
    },
    {
      scope: rootRef,
      dependencies: [paths, duration, writeIn, delay],
      revertOnUpdate: true,
    }
  )

  const loading = !fontReady
  const fallback = fontReady && paths.length === 0

  return (
    <div ref={rootRef} className={className}>
      {loading && (
        <span
          className="inline-block h-[1em] w-48 max-w-[80vw]"
          style={{ fontSize }}
          aria-hidden
        />
      )}

      {fallback && (
        // The CSS face is only needed here; on the wrapper it made the browser
        // download the file a second time alongside opentype.js's fetch.
        <p
          className={cn(fontSignature.className, "font-semibold")}
          style={{ fontSize }}
        >
          {text}
        </p>
      )}

      {paths.length > 0 && (
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          fill="none"
          // Shrinks with its container on narrow screens, keeping proportions.
          className="h-auto max-w-full overflow-visible"
          aria-hidden
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              {paths.map((d, i) => (
                <path
                  key={`mask-${text}-${i}`}
                  ref={(el) => {
                    maskPathRefs.current[i] = el
                  }}
                  className="invisible opacity-0 data-[mask-ready=true]:visible data-[mask-ready=true]:opacity-100"
                  d={d}
                  fill="none"
                  stroke="white"
                  strokeWidth={maskStroke}
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </mask>
          </defs>

          <g mask={`url(#${maskId})`}>
            {paths.map((d, i) => (
              <path
                key={`fill-${text}-${i}`}
                d={d}
                fill={color}
                stroke="none"
              />
            ))}
          </g>
        </svg>
      )}
    </div>
  )
}
