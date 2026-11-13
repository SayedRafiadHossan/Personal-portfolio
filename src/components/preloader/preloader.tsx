"use client"

import { profile } from "@/data/data"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { createContext, useContext, useEffect, useRef, useState } from "react"

import { PreloaderSignature } from "@/components/preloader/preloader-signature"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, CustomEase, ScrollTrigger)

/** Playback speed of the exit (line rises, signature sinks, page opens). 1 = original. */
const OUTRO_SPEED = 1.7

const ease = {
  out: CustomEase.create("llf-out", "0.22,1,0.36,1"),
  expo: CustomEase.create("llf-expo", "0.16,1,0.3,1"),
  inOut: CustomEase.create("llf-in-out", "0.76,0,0.24,1"),
}

const ASSET_TIMEOUT = 6000

const label = "text-[11px] font-medium tracking-[0.08em] uppercase"

const PreloaderReadyContext = createContext(true)
const PreloaderOpenedContext = createContext(true)

/** True from the moment the page starts opening: sections set themselves up. */
export const usePreloaderReady = () => useContext(PreloaderReadyContext)
/** True once the page has opened, for entrances that should play after the loader. */
export const usePreloaderOpened = () => useContext(PreloaderOpenedContext)

/** Fonts, capped so a slow network never holds the page. */
const assetsReady = () =>
  Promise.race([
    document.fonts?.ready,
    new Promise((resolve) => setTimeout(resolve, ASSET_TIMEOUT)),
  ])

const Clock = () => {
  const [time, setTime] = useState("--:--")

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
    let timer = 0
    const tick = () => {
      setTime(format.format(new Date()))
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5)
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [])

  return <time className="tabular-nums">{time}</time>
}

type PreloaderProps = Readonly<{
  children: React.ReactNode
}>

export const Preloader = ({ children }: PreloaderProps) => {
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const [opened, setOpened] = useState(false)

  const [signature] = useState(() => {
    let resolve: () => void = () => {}
    const promise = new Promise<void>((r) => {
      resolve = r
    })
    return { promise, resolve }
  })
  const drawnRef = useRef<((progress: number) => void) | null>(null)

  const contentRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const signatureRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)

  useGSAP((_context, contextSafe) => {
    const content = contentRef.current
    const dim = dimRef.current
    const panel = panelRef.current
    const sig = signatureRef.current
    const line = lineRef.current
    const track = trackRef.current
    const fill = fillRef.current
    const dot = dotRef.current
    const count = countRef.current
    const meta = metaRef.current
    if (
      !content ||
      !dim ||
      !panel ||
      !sig ||
      !line ||
      !track ||
      !fill ||
      !dot ||
      !count ||
      !meta
    ) {
      return
    }

    const safe = <T extends (...args: never[]) => void>(fn: T) =>
      contextSafe ? contextSafe(fn) : fn
    const markReady = safe(() => setReady(true))
    const markOpened = safe(() => {
      performance.mark("preloader:opened")
      setOpened(true)
    })
    const markDone = safe(() => setDone(true))

    // The loader plays on every page load.
    const finish = markDone

    const progress = { value: 0 }
    // Measured once: reading layout every frame forces a reflow per frame.
    // The counter is tabular-nums, so its width doesn't change as it counts.
    const countWidth = count.offsetWidth
    const lineWidth = line.offsetWidth
    const render = () => {
      const p = progress.value / 100
      fill.style.transform = `scaleX(${p})`
      count.textContent = `${String(Math.round(progress.value)).padStart(3, "0")}%`
      // The counter rides the tip of the line, never past the left edge
      count.style.left = `${Math.max(countWidth, p * lineWidth)}px`
    }
    render()

    // The line follows the pen: every frame of the signature stroke nudges it forward
    const follow = gsap.quickTo(progress, "value", {
      duration: 0.45,
      ease: "power3.out",
      onUpdate: render,
    })
    drawnRef.current = (p) => follow(p * 100)

    // The page starts zoomed in and settles as it opens. The zoom is applied in
    // `leave`, after the sections have measured themselves at rest: measuring a
    // zoomed page forced a full ScrollTrigger.refresh() in the middle of the hero reveal.
    const zoomIn = () =>
      gsap.set(content, {
        scale: 1.25,
        // Around the visible viewport, not the middle of the whole page
        transformOrigin: `50% ${window.scrollY + window.innerHeight / 2}px`,
        willChange: "transform",
      })

    const intro = gsap
      .timeline({ defaults: { ease: ease.out } })
      .fromTo(
        [meta, count],
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.8 },
        0.2
      )
      .fromTo(
        track,
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: ease.inOut, transformOrigin: "left center" },
        0.1
      )

    // A circular hole in the sheet, growing out of the centre dot (evenodd path):
    // 0 = closed, 1 = past the corners. Sized in px when the exit starts.
    const hole = { r: 0 }
    let stageW = 0
    let stageH = 0
    const cut = () => {
      const cx = stageW / 2
      const cy = stageH / 2
      const r = hole.r * (Math.hypot(stageW, stageH) / 2 + 2)
      panel.style.clipPath = `path(evenodd, "M0 0H${stageW}V${stageH}H0Z M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z")`
    }

    let outro: gsap.core.Timeline | null = null
    const exit = () => {
      drawnRef.current = null
      const stage = panel.getBoundingClientRect()
      stageW = stage.width
      stageH = stage.height
      const middle = stage.top + stage.height / 2
      const lineBox = line.getBoundingClientRect()
      const lineStart = lineBox.top + lineBox.height / 2
      const sigBox = sig.getBoundingClientRect()

      // The script's tails spill past the SVG box, so measure the ink itself
      const inkTop = Math.min(
        sigBox.top,
        ...Array.from(sig.querySelectorAll("svg > :not(defs), svg > :not(defs) *"))
          .map((el) => el.getBoundingClientRect())
          .filter((box) => box.height > 0)
          .map((box) => box.top)
      )
      // The signature sinks just far enough for all of its ink to pass under the centre line
      const sink = middle - inkTop + 12

      // Everything under the line is hidden: the line is the bottom edge of the signature's clip
      const wipe = () => {
        const lineY = lineStart + Number(gsap.getProperty(line, "y"))
        const sigBottom = sigBox.bottom + Number(gsap.getProperty(sig, "y"))
        sig.style.clipPath = `inset(-200px -200px ${sigBottom - lineY}px -200px)`
      }

      // Hand the fill's transform over to GSAP
      gsap.set(fill, { scaleX: 1, transformOrigin: "50% 50%" })

      outro = gsap
        .timeline({ onComplete: finish })
        .to([meta, count], { autoAlpha: 0, y: 8, duration: 0.45, ease: "power2.in" }, 0)
        .to(track, { autoAlpha: 0, duration: 0.5 }, 0)
        // The line rises to the centre of the screen and holds there...
        .to(line, { y: middle - lineStart, duration: 1, ease: ease.inOut, onUpdate: wipe }, 0.1)
        // ...while the signature sinks into it, wiped away at the centre line
        .to(sig, { y: sink, duration: 1.2, ease: ease.inOut, onUpdate: wipe }, 0.5)
        // It folds into the centre point...
        .to(fill, { scaleX: 0, duration: 0.7, ease: ease.inOut }, 1.65)
        .fromTo(
          dot,
          { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.3, ease: ease.out },
          2.1
        )
        // ...and the page opens out of that point as a growing circle: dot, then page.
        // Sections were already set up before the exit began (see `leave` below), so
        // nothing heavy runs here.
        .add("open", 2.35)
        .call(() => performance.mark("preloader:open"), undefined, "open")
        .to(dot, { scale: 0, autoAlpha: 0, duration: 0.2, ease: "power2.in" }, "open")
        .to(hole, { r: 1, duration: 1.2, ease: ease.expo, onUpdate: cut }, "open")
        // The hole is all but open by now: the hero starts revealing itself piece by piece.
        .call(markOpened, undefined, "open+=0.7")
        // The dim lifts quickly so the circle shows the page, not a grey patch
        .to(dim, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, "open")
        .to(
          content,
          {
            scale: 1,
            duration: 2.3,
            ease: ease.expo,
            clearProps: "transform,transformOrigin,willChange",
          },
          "open"
        )
      // Same choreography, played faster so the site opens sooner.
      outro.timeScale(OUTRO_SPEED)
    }

    let complete: gsap.core.Tween | null = null
    let cancelled = false
    let leaveTimer = 0
    let leaveFrame = 0

    // Sections build their scroll animations when "ready" flips, which blocks the
    // page for a moment. Do it now, while the finished signature sits still, and
    // start the exit only once that work is done (the timeout can't fire until the
    // main thread is free), so the opening itself never stutters.
    const leave = () => {
      performance.mark("preloader:setup")
      markReady()
      leaveTimer = window.setTimeout(() => {
        leaveFrame = requestAnimationFrame(() => {
          leaveFrame = requestAnimationFrame(() => {
            if (cancelled) return
            // Sections are measured; now zoom the (still hidden) page and leave.
            zoomIn()
            performance.mark("preloader:exit")
            exit()
          })
        })
      }, 60)
    }

    Promise.all([signature.promise, assetsReady()]).then(() => {
      if (cancelled) return
      complete = gsap.to(progress, {
        value: 100,
        duration: 0.25,
        ease: "power2.out",
        overwrite: true,
        onUpdate: render,
        onComplete: leave,
      })
    })

    return () => {
      cancelled = true
      window.clearTimeout(leaveTimer)
      cancelAnimationFrame(leaveFrame)
      drawnRef.current = null
      ;[intro, complete, outro].forEach((tween) => tween?.kill())
      gsap.set(content, { clearProps: "transform,transformOrigin,willChange" })
    }
  })

  return (
    <PreloaderReadyContext.Provider value={ready}>
    {/* `done` as a fallback, so the hero never stays hidden if the outro is cut short */}
    <PreloaderOpenedContext.Provider value={opened || done}>
      {!done && (
        <div aria-hidden="true" data-preloader className="fixed inset-0 z-120">
          {/* Dims the page while it opens, cheaper than filtering the whole page */}
          <div ref={dimRef} className="absolute inset-0 bg-black/80" />

          {/* One black sheet; the exit cuts a hole in it that grows out from the centre */}
          <div ref={panelRef} className="absolute inset-0 bg-black" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div ref={signatureRef}>
              <PreloaderSignature
                onComplete={signature.resolve}
                onProgress={(p) => drawnRef.current?.(p)}
              />
            </div>
          </div>

          <span
            ref={dotRef}
            className="absolute top-1/2 left-1/2 -mt-[3px] -ml-[3px] size-1.5 rounded-full bg-white opacity-0"
          />

          <div className="absolute inset-x-0 bottom-0 px-5 pb-8 sm:px-8 lg:px-12 lg:pb-12">
            <div ref={lineRef} className="relative h-px w-full">
              <div ref={trackRef} className="absolute inset-0 bg-white/15" />
              <div
                ref={fillRef}
                className="absolute inset-0 origin-left bg-white"
                style={{ transform: "scaleX(0)" }}
              />
              <span
                ref={countRef}
                className={cn(
                  label,
                  "absolute bottom-3 left-0 -translate-x-full text-white tabular-nums opacity-0"
                )}
              >
                000%
              </span>
            </div>
            <div
              ref={metaRef}
              className={cn(label, "mt-4 flex justify-between gap-6 text-white/50 opacity-0")}
            >
              <span>
                Local time {"//"} <Clock />
              </span>
              <span suppressHydrationWarning>
                {profile.name} ©{new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={contentRef}>{children}</div>
    </PreloaderOpenedContext.Provider>
    </PreloaderReadyContext.Provider>
  )
}
