"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLenis } from "lenis/react"
import Image from "next/image"
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react"

import {
  usePreloaderOpened,
  usePreloaderReady,
} from "@/components/preloader/preloader"
import { ProjectBadge } from "@/components/ui/project-badge"
import { featuredWorks, profile } from "@/data/data"

import { TextReveal } from "../animation"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const STEP_COUNT = featuredWorks.length
/** Roughly how long the hero's entrance runs after the loader opens. */
const HERO_ENTRANCE_MS = 3500

// Tablet widths (md, below lg) use a single wide card with the copy below it.
const COMPACT_QUERY = "(max-width: 1023px)"

const subscribeCompact = (onChange: () => void) => {
  const mq = window.matchMedia(COMPACT_QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

const useCompact = () =>
  useSyncExternalStore(
    subscribeCompact,
    () => window.matchMedia(COMPACT_QUERY).matches,
    () => false
  )

// Card placement by distance from the active step. yPercent is relative to
// the card's own height (50vh), so 50 centres it in the 100vh stage. On
// compact layouts there is no room for the peeking neighbours, so cards just
// slide and fade through the one slot.
const getCardState = (offset: number, compact: boolean): gsap.TweenVars => {
  if (compact) {
    if (offset === 0)
      return { yPercent: 0, scale: 1, opacity: 1, pointerEvents: "auto" }
    return {
      yPercent: offset < 0 ? -35 : 35,
      scale: 0.88,
      opacity: 0,
      pointerEvents: "none",
    }
  }
  if (offset === 0)
    return { yPercent: 50, scale: 1, opacity: 1, pointerEvents: "auto" }
  if (offset === -1)
    return { yPercent: -20, scale: 0.3, opacity: 0.4, pointerEvents: "none" }
  if (offset <= -2)
    return { yPercent: -50, scale: 0, opacity: 0, pointerEvents: "none" }
  if (offset === 1)
    return { yPercent: 120, scale: 0.3, opacity: 0.4, pointerEvents: "none" }
  return { yPercent: 160, scale: 0.1, opacity: 0.1, pointerEvents: "none" }
}

const SplitWords = ({ text }: { text: string }) =>
  text.split(" ").map((word, i) => (
    <span
      key={i}
      className="inline-block overflow-hidden pb-[0.08em] align-bottom"
    >
      <span data-word className="inline-block">
        {word}
        {" "}
      </span>
    </span>
  ))

type FeaturedWorksDesktopProps = Readonly<{
  /** GitHub stars keyed by repo. */
  stars: Record<string, number>
}>

export const FeaturedWorksDesktop = ({ stars }: FeaturedWorksDesktopProps) => {
  const ready = usePreloaderReady()
  const opened = usePreloaderOpened()
  const lenis = useLenis()
  const [active, setActive] = useState(0)
  const compact = useCompact()

  const stageRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const backdropRefs = useRef<(HTMLDivElement | null)[]>([])
  const titleRefs = useRef<(HTMLDivElement | null)[]>([])
  const descRefs = useRef<(HTMLDivElement | null)[]>([])
  const ringRef = useRef<SVGCircleElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorArrowRef = useRef<HTMLSpanElement>(null)
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null)
  const cursorVisibleRef = useRef(false)
  const activeRef = useRef(0)
  const prevRef = useRef<number | null>(null)
  const prevCompactRef = useRef<boolean | null>(null)
  const stRef = useRef<ScrollTrigger | null>(null)

  const setCursorVisible = (visible: boolean) => {
    if (cursorVisibleRef.current === visible) return
    cursorVisibleRef.current = visible
    gsap.to(cursorRef.current, {
      scale: visible ? 1 : 0,
      duration: visible ? 0.6 : 0.35,
      ease: visible ? "back.out(2)" : "power3.in",
      overwrite: "auto",
    })
  }

  // Cards move under a still pointer when scrolling switches steps, so
  // re-test what is under the last known pointer position instead of
  // relying on pointer events alone. Inactive cards have pointer-events:
  // none, so only the active card can match.
  const syncCursor = () => {
    const pointer = lastPointerRef.current
    const target = pointer
      ? document.elementFromPoint(pointer.x, pointer.y)
      : null
    setCursorVisible(target?.closest("[data-card]") != null)
  }

  // Mark the stage while it is on (or about to be on) screen. The blurred backdrops
  // only become GPU layers then: promoted from page load, the browser rasterised five
  // full-screen blurs during the intro, because this section sits right under the hero.
  // Watching starts after the hero's entrance has played, so that work never lands on it.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !opened) return
    let observer: IntersectionObserver | null = null
    const timer = window.setTimeout(() => {
      observer = new IntersectionObserver(
        ([entry]) => stage.toggleAttribute("data-near", entry.isIntersecting),
        { rootMargin: "50% 0px" }
      )
      observer.observe(stage)
    }, HERO_ENTRANCE_MS)
    return () => {
      window.clearTimeout(timer)
      observer?.disconnect()
    }
  }, [opened])

  // Pin the stage and map scroll progress to a step index.
  useGSAP(
    () => {
      const stage = stageRef.current
      if (!stage || !ready) return

      const mm = gsap.matchMedia()

      mm.add("(min-width: 768px)", () => {
        const st = ScrollTrigger.create({
          trigger: stage,
          start: "top top",
          end: `+=${STEP_COUNT * 100}%`,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const raw = self.progress * STEP_COUNT
            const index = Math.min(Math.floor(raw), STEP_COUNT - 1)
            // Set directly — GSAP would round this 0–1 value to whole pixels.
            if (ringRef.current) {
              ringRef.current.style.strokeDashoffset = String(
                1 - Math.min(raw - index, 1)
              )
            }
            if (index !== activeRef.current) {
              activeRef.current = index
              setActive(index)
            }
            syncCursor()
          },
        })

        stRef.current = st

        return () => {
          stRef.current = null
        }
      })

      return () => mm.revert()
    },
    { scope: stageRef, dependencies: [ready], revertOnUpdate: true }
  )

  // Transition cards, backdrop and copy whenever the active step changes.
  useGSAP(
    () => {
      const prev = prevRef.current
      prevRef.current = active
      const layoutChanged = prevCompactRef.current !== compact
      prevCompactRef.current = compact

      const instant =
        prev === null ||
        layoutChanged ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const duration = instant ? 0 : 0.8

      cardRefs.current.forEach((card, i) => {
        if (!card) return
        const offset = i - active
        gsap.set(card, { zIndex: STEP_COUNT - Math.abs(offset) })
        gsap.to(card, {
          ...getCardState(offset, compact),
          duration,
          ease: "power3.out",
          overwrite: "auto",
        })
      })

      backdropRefs.current.forEach((bg, i) => {
        if (!bg) return
        gsap.to(bg, {
          opacity: i === active ? 1 : 0,
          duration: instant ? 0 : 0.6,
          ease: "power2.out",
          overwrite: "auto",
        })
      })

      const swapCopy = (
        group: (HTMLDivElement | null)[],
        stagger: number,
        delay: number
      ) => {
        group.forEach((el, i) => {
          if (!el) return
          const words = el.querySelectorAll("[data-word]")
          gsap.killTweensOf([el, ...words])

          if (i === active) {
            gsap.set(el, { autoAlpha: 1 })
            gsap.fromTo(
              words,
              { yPercent: instant ? 0 : 110 },
              {
                yPercent: 0,
                duration: instant ? 0 : 0.6,
                delay: instant ? 0 : delay,
                stagger: instant ? 0 : stagger,
                ease: "power3.out",
              }
            )
          } else if (i === prev && !instant) {
            gsap.to(words, {
              yPercent: -110,
              duration: 0.35,
              stagger: stagger / 3,
              ease: "power2.in",
            })
            gsap.set(el, { autoAlpha: 0, delay: 0.45 })
          } else {
            gsap.set(el, { autoAlpha: 0 })
          }
        })
      }

      swapCopy(titleRefs.current, 0.05, 0.15)
      swapCopy(descRefs.current, 0.012, 0.25)

      // Re-test once the cards have settled into their new slots.
      if (!instant) gsap.delayedCall(duration + 0.05, syncCursor)
    },
    { scope: stageRef, dependencies: [active, compact] }
  )

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const cursor = cursorRef.current
    const stage = stageRef.current
    if (!cursor || !stage) return
    const rect = stage.getBoundingClientRect()
    gsap.to(cursor, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
    })
    setCursorVisible((e.target as Element).closest("[data-card]") !== null)

    // Point the arrow the way the pointer travels (↗ is its resting -45°).
    const last = lastPointerRef.current
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    if (!last) return
    const dx = e.clientX - last.x
    const dy = e.clientY - last.y
    if (Math.hypot(dx, dy) < 3) return
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 45
    gsap.to(cursorArrowRef.current, {
      rotation: `${angle}_short`,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    })
  }

  const handlePointerLeave = () => {
    lastPointerRef.current = null
    setCursorVisible(false)
  }

  // Keyboard users tab through every card; jump the pinned scroll to match.
  const scrollToStep = (index: number) => {
    const st = stRef.current
    if (!st || index === activeRef.current) return
    const y = st.start + ((index + 0.5) / STEP_COUNT) * (st.end - st.start)
    if (lenis) lenis.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
  }

  return (
    <section className="hidden md:block">
      {/* intro */}
      <div className="main-container py-20 lg:py-28">
        <div className="mx-auto max-w-[760px] space-y-6 text-center">
          <TextReveal delay={0.1}>
            <h2 className="overflow-hidden pb-[0.06em] font-aspekta-600 text-aspekta-heading-5 tracking-[-0.05em] text-background-1 lg:text-aspekta-heading-4">
              Selected work
            </h2>
          </TextReveal>
          <TextReveal delay={0.2}>
            <p className="mx-auto max-w-[32rem] overflow-hidden font-aspekta-400 text-[1.1875rem] leading-[1.55] tracking-[-0.01em] text-background-1/75">
              Open-source libraries and production templates, built solo and with the team at {profile.company.name}.
            </p>
          </TextReveal>
        </div>
      </div>

      {/* pinned stage */}
      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="group/works relative h-screen w-full overflow-hidden bg-background-1 text-background-2 [--card-h:calc(min(84vw,74vh)*0.625)] [--card-top:max(12vh,calc((100vh-var(--card-h)-10rem)/2))] [--card-x:calc((100%-min(84vw,74vh))/2)]"
      >
        <div aria-hidden className="absolute inset-0">
          {featuredWorks.map((work, i) => (
            <div
              key={work.title}
              ref={(el) => {
                backdropRefs.current[i] = el
              }}
              // Own GPU layer while the stage is near the screen (data-near): the blur is
              // rasterised once, so cross-fading only changes opacity instead of
              // re-blurring a full-screen image every frame.
              className="absolute inset-0 opacity-0 group-data-near/works:transform-gpu group-data-near/works:will-change-[opacity]"
            >
              <Image
                src={work.image}
                alt=""
                fill
                // It's blurred anyway: a small source upscales soft and costs far less to blur.
                sizes="25vw"
                quality={40}
                className="scale-110 object-cover blur-xl"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-background-1/70" />
          <div className="absolute inset-0 bg-linear-to-r from-background-1/80 via-transparent to-background-1/80" />
        </div>

        {featuredWorks.map((work, i) => (
          <a
            key={work.title}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            href={work.href}
            target="_blank"
            rel="noopener noreferrer"
            data-card
            aria-label={`Explore ${work.title}`}
            onFocus={() => scrollToStep(i)}
            className="absolute inset-x-0 top-(--card-top) mx-auto block aspect-[16/10] w-[min(84vw,74vh)] overflow-hidden rounded-2xl bg-background-1 opacity-0 ring-1 ring-background-2/10 will-change-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background-2 lg:top-0 lg:aspect-auto lg:h-[50vh] lg:w-[45vw]"
          >
            <Image
              src={work.image}
              alt={work.imageAlt}
              fill
              sizes="45vw"
              className="object-cover"
              style={{ objectPosition: work.imagePosition }}
            />
            <ProjectBadge
              kind={work.kind}
              stars={work.repo ? stars[work.repo] : undefined}
              className="absolute top-4 left-4"
            />
          </a>
        ))}

        {/* copy */}
        <div className="pointer-events-none absolute inset-x-0 top-[calc(var(--card-top)+var(--card-h)+2.5rem)] z-20 flex flex-col items-start gap-4 pr-[calc(var(--card-x)+6.5rem)] pl-(--card-x) lg:top-1/2 lg:-translate-y-1/2 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:pr-12 lg:pl-12">
          <div className="grid w-full lg:w-[24vw]">
            {featuredWorks.map((work, i) => (
              <div
                key={work.title}
                ref={(el) => {
                  titleRefs.current[i] = el
                }}
                className={
                  i === 0 ? "[grid-area:1/1]" : "invisible [grid-area:1/1]"
                }
              >
                <h3 className="pb-[0.06em] font-aspekta-600 text-aspekta-heading-8 tracking-[-0.045em] lg:text-aspekta-heading-7 xl:text-aspekta-heading-6">
                  <SplitWords text={work.title} />
                </h3>
              </div>
            ))}
          </div>

          <div className="grid w-full max-w-xl lg:w-[21vw]">
            {featuredWorks.map((work, i) => (
              <div
                key={work.title}
                ref={(el) => {
                  descRefs.current[i] = el
                }}
                className={
                  i === 0 ? "[grid-area:1/1]" : "invisible [grid-area:1/1]"
                }
              >
                <p className="font-aspekta-400 text-[1.0625rem] leading-[1.55] tracking-[-0.01em] text-background-2/85">
                  <SplitWords text={work.description} />
                </p>
                <p className="mt-4 text-tagline-3 leading-[1.55] text-background-2/65">
                  <SplitWords text={`My role: ${work.role}`} />
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {work.stack.map((tech) => (
                    <li key={tech} className="overflow-hidden">
                      <span
                        data-word
                        className="inline-block rounded-full border border-background-2/15 px-2.5 py-1 text-tagline-4 text-background-2/75"
                      >
                        {tech}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* step counter */}
        <div
          aria-hidden
          className="absolute top-[calc(var(--card-top)+var(--card-h)+2rem)] left-[calc(50%+min(84vw,74vh)/2-5rem)] z-20 flex size-20 items-center justify-center lg:top-auto lg:right-[4%] lg:bottom-[14%] lg:left-auto"
        >
          <svg
            viewBox="0 0 80 80"
            className="absolute inset-0 size-full -rotate-90"
          >
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              strokeWidth="1"
              className="stroke-background-2/20"
            />
            <circle
              ref={ringRef}
              cx="40"
              cy="40"
              r="35"
              fill="none"
              strokeWidth="1"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              className="stroke-background-2"
            />
          </svg>
          <span className="font-aspekta-500 text-tagline-2 tabular-nums">
            {String(active + 1).padStart(2, "0")}
          </span>
        </div>

        {/* hover cursor */}
        <div
          ref={cursorRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 z-30 -mt-16 -ml-16 size-32 scale-0"
        >
          <div className="absolute inset-0 rounded-full border border-background-2/20 bg-background-1/35 backdrop-blur-md" />
          <svg
            viewBox="0 0 128 128"
            className="absolute inset-0 size-full text-background-2 motion-safe:animate-[spin_12s_linear_infinite]"
          >
            <defs>
              <path
                id="featured-cursor-ring"
                d="M64 64m-49 0a49 49 0 1 1 98 0a49 49 0 1 1-98 0"
              />
            </defs>
            {/* textLength = ring circumference, so the phrase closes seamlessly. */}
            <text
              className="fill-current font-aspekta-600 text-[10px] uppercase"
              textLength="307"
              lengthAdjust="spacing"
            >
              <textPath href="#featured-cursor-ring">
                View project · View project ·
              </textPath>
            </text>
          </svg>
          <span
            ref={cursorArrowRef}
            className="absolute top-1/2 left-1/2 -mt-7 -ml-7 flex size-14 items-center justify-center rounded-full bg-background-2 text-background-1"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-6">
              <path
                d="M7 17 17 7M8 7h9v9"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </section>
  )
}
