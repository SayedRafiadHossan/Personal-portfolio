import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { aboutSlides } from "@/data/data"

import { slideNumber } from "./about-slide-number"
import {
  applyContent,
  applyDialFaces,
  applyImage,
  applyIndex,
  applyNowDot,
  applyProgressArc,
  CX,
  CY,
  ensureBouncyEase,
  pulseNeedle,
  STEP_ANGLE,
} from "./motion"
import { type SlideRefs } from "./refs"

export const SLIDE_COUNT = aboutSlides.length
export const MAX_ROTATION = -(SLIDE_COUNT - 1) * STEP_ANGLE
export const TOTAL_LABEL = String(SLIDE_COUNT).padStart(2, "0")

type ShowSlide = (index: number, immediate: boolean, direction: number) => void

export const setupAboutScroll = ({
  root,
  wheel,
  tickWheel,
  outerRing,
  innerRing,
  progressArc,
  progressSpin,
  needle,
  indexEl,
  liveEl,
  refs,
  contextSafe,
  reduceMotion,
  maxRotation = MAX_ROTATION,
  tangentFaces = false,
  angleSign = 1,
  skipIntro = false,
  lightMotion = false,
  scrub = 0.6 as boolean | number,
  pinType,
  stepped = false,
  onSlideChange,
}: {
  root: HTMLElement
  wheel: HTMLElement
  tickWheel: HTMLElement | null
  outerRing: SVGCircleElement | null
  innerRing: SVGCircleElement | null
  progressArc: SVGCircleElement | null
  progressSpin: SVGGElement | null
  needle: SVGGElement | null
  indexEl: HTMLSpanElement | null
  liveEl: HTMLDivElement | null
  /** Called whenever a slide becomes active. */
  onSlideChange?: (index: number, immediate: boolean) => void
  refs: SlideRefs[]
  contextSafe: (fn: ShowSlide) => ShowSlide
  reduceMotion: boolean
  maxRotation?: number
  tangentFaces?: boolean
  angleSign?: number
  skipIntro?: boolean
  lightMotion?: boolean
  scrub?: boolean | number
  pinType?: "transform" | "fixed"
  stepped?: boolean
}) => {
  ensureBouncyEase()

  const faces = refs
    .map((r) => r.face)
    .filter((el): el is HTMLSpanElement => el !== null)

  const syncDial = (rotation: number) => {
    applyDialFaces(faces, rotation, { tangent: tangentFaces, angleSign })
    if (progressArc) {
      applyProgressArc(progressArc, progressSpin, rotation, maxRotation)
    }
  }

  const showSlide = contextSafe(
    (index: number, immediate: boolean, direction: number) => {
      refs.forEach((r, i) => {
        const isActive = i === index
        if (r.content) {
          if (lightMotion) {
            r.content.setAttribute("aria-hidden", isActive ? "false" : "true")
            if (isActive) r.content.removeAttribute("inert")
            else r.content.setAttribute("inert", "")
            gsap.to(r.content, {
              autoAlpha: isActive ? 1 : 0,
              duration: immediate ? 0 : 0.28,
              ease: "power2.out",
              overwrite: true,
            })
          } else {
            applyContent(r.content, isActive, immediate, direction)
          }
        }
        if (r.image) {
          if (lightMotion) {
            if (r.image.parentElement) {
              gsap.set(r.image.parentElement, { zIndex: isActive ? 2 : 1 })
            }
            gsap.to(r.image, {
              autoAlpha: isActive ? 1 : 0,
              duration: immediate ? 0 : 0.28,
              ease: "power2.out",
              overwrite: true,
            })
          } else {
            applyImage(r.image, isActive, immediate, direction)
          }
        }
      })

      const nowDot = refs[index]?.nowDot
      if (nowDot && !lightMotion) applyNowDot(nowDot, immediate)
      if (needle && !lightMotion) pulseNeedle(needle, immediate)
      if (indexEl) {
        applyIndex(indexEl, slideNumber(index), immediate, direction)
      }
      if (liveEl) liveEl.textContent = aboutSlides[index]?.title ?? ""
      onSlideChange?.(index, immediate)
    }
  )

  let activeIndex = 0

  const revealRing = (el: SVGCircleElement, done: boolean) => {
    const c = 2 * Math.PI * Number(el.getAttribute("r"))
    gsap.set(el, {
      strokeDasharray: c,
      strokeDashoffset: done ? 0 : c,
    })
  }

  gsap.set(wheel, { rotation: 0 })
  if (tickWheel) {
    gsap.set(tickWheel, { rotation: 0, transformOrigin: "50% 50%" })
  }
  if (progressSpin) {
    progressSpin.setAttribute("transform", `rotate(0 ${CX} ${CY})`)
  }
  if (progressArc) {
    applyProgressArc(progressArc, progressSpin, 0, maxRotation)
  }
  if (outerRing) revealRing(outerRing, reduceMotion || skipIntro)
  if (innerRing) revealRing(innerRing, reduceMotion || skipIntro)
  if (needle) gsap.set(needle, { autoAlpha: reduceMotion || skipIntro ? 1 : 0 })
  syncDial(0)

  if (reduceMotion || skipIntro) {
    showSlide(0, true, 1)
  } else {
    gsap.set(wheel, { autoAlpha: 0 })
    refs.forEach((r) => {
      if (r.content) applyContent(r.content, false, true, 1)
      if (r.image) applyImage(r.image, false, true, 1)
    })
  }

  const rotateTo = (index: number, immediate: boolean) => {
    const rotation =
      SLIDE_COUNT === 1 ? 0 : (index / (SLIDE_COUNT - 1)) * maxRotation
    const duration = immediate ? 0 : 0.5
    gsap.to(wheel, {
      rotation,
      duration,
      ease: "power2.out",
      overwrite: true,
      force3D: true,
      onUpdate: () => {
        syncDial(Number(gsap.getProperty(wheel, "rotation")))
      },
    })
    if (tickWheel) {
      gsap.to(tickWheel, {
        rotation,
        duration,
        ease: "power2.out",
        overwrite: true,
        force3D: true,
      })
    }
  }

  const selectSlide = (progress: number) => {
    const raw = gsap.utils.clamp(
      0,
      SLIDE_COUNT - 1,
      progress * (SLIDE_COUNT - 1)
    )
    const target = Math.round(raw)
    if (target === activeIndex) return
    if (!stepped && Math.abs(raw - activeIndex) < 0.58) return
    const direction = target > activeIndex ? 1 : -1
    activeIndex = target
    if (stepped) rotateTo(target, Boolean(reduceMotion))
    showSlide(target, Boolean(reduceMotion), direction)
  }

  const onProgress = (self: ScrollTrigger) => selectSlide(self.progress)

  const scrollTriggerBase = {
    trigger: root,
    start: "top top",
    end: `+=${(SLIDE_COUNT - 1) * (stepped ? 55 : 100)}%`,
    pin: true,
    pinType,
    anticipatePin: 1,
    fastScrollEnd: true,
    invalidateOnRefresh: true,
  }

  if (reduceMotion) {
    ScrollTrigger.create({
      ...scrollTriggerBase,
      onUpdate: onProgress,
    })
    return
  }

  if (stepped) {
    const step = SLIDE_COUNT === 1 ? 1 : 1 / (SLIDE_COUNT - 1)
    ScrollTrigger.create({
      ...scrollTriggerBase,
      snap: {
        snapTo: step,
        duration: 0.4,
        delay: 0,
        ease: "power2.out",
        directional: true,
        inertia: false,
      },
      onUpdate: onProgress,
      onToggle: (self) => {
        wheel.style.willChange = self.isActive ? "transform" : "auto"
      },
    })
    return () => {
      wheel.style.willChange = "auto"
    }
  }

  // The first slide shows straight away; the rings draw alongside it rather than first.
  const intro = gsap.timeline({ paused: true })
  if (!skipIntro) {
    // Scrolling may already have moved past the first slide by the time this fires
    intro.add(() => showSlide(activeIndex, false, 1), 0)
    intro.to(wheel, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0)
    if (outerRing) {
      intro.to(
        outerRing,
        { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" },
        0
      )
    }
    if (innerRing) {
      intro.to(
        innerRing,
        { strokeDashoffset: 0, duration: 0.85, ease: "power2.inOut" },
        0.08
      )
    }
    if (needle) {
      intro.to(
        needle,
        { autoAlpha: 1, duration: 0.35, ease: "power2.out" },
        0.3
      )
    }
  }

  let introPlayed = skipIntro
  const playIntro = () => {
    if (introPlayed) return
    introPlayed = true
    intro.play()
  }

  // Start while the section is still scrolling in, so it's already showing by
  // the time it pins.
  if (!skipIntro) {
    ScrollTrigger.create({
      trigger: root,
      start: "top 55%",
      once: true,
      onEnter: playIntro,
    })
  }

  const tl = gsap.timeline({
    onUpdate: () => {
      syncDial(Number(gsap.getProperty(wheel, "rotation")))
      selectSlide(tl.progress())
    },
    scrollTrigger: {
      ...scrollTriggerBase,
      scrub,
      onToggle: (self) => {
        wheel.style.willChange = self.isActive ? "transform" : "auto"
        if (self.isActive) playIntro()
      },
    },
  })

  if (tickWheel) {
    tl.to(
      tickWheel,
      {
        rotation: maxRotation,
        ease: "none",
        force3D: true,
      },
      0
    )
  }
  tl.to(wheel, { rotation: maxRotation, ease: "none", force3D: true }, 0)

  return () => {
    wheel.style.willChange = "auto"
  }
}
