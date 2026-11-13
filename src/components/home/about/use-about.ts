"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useRef } from "react"

import { usePreloaderReady } from "@/components/preloader/preloader"

import { areSlideRefsReady, assignSlideRef, type SlideRefs } from "./refs"
import { setupAboutScroll, SLIDE_COUNT, MAX_ROTATION } from "./scroll"

gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase)

export const useAbout = (
  match: string,
  options?: {
    maxRotation?: number
    tangentFaces?: boolean
    angleSign?: number
    skipIntro?: boolean
    lightMotion?: boolean
    scrub?: boolean | number
    stepped?: boolean
    onSlideChange?: (index: number, immediate: boolean) => void
  }
) => {
  const ready = usePreloaderReady()
  const maxRotation = options?.maxRotation ?? MAX_ROTATION
  const tangentFaces = options?.tangentFaces ?? false
  const angleSign = options?.angleSign ?? 1
  const skipIntro = options?.skipIntro ?? false
  const lightMotion = options?.lightMotion ?? false
  const scrub = options?.scrub ?? 1
  const stepped = options?.stepped ?? false
  const rootRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const tickWheelRef = useRef<HTMLDivElement>(null)
  const outerRingRef = useRef<SVGCircleElement>(null)
  const innerRingRef = useRef<SVGCircleElement>(null)
  const progressRef = useRef<SVGCircleElement>(null)
  const progressSpinRef = useRef<SVGGElement>(null)
  const needleRef = useRef<SVGGElement>(null)
  const indexRef = useRef<HTMLSpanElement>(null)
  const liveRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<SlideRefs[]>([])

  // Pause the always-on CSS animations (spinning rings, blinking eyes) while the
  // section is off screen; see [data-offscreen] in style/common.css.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => {
      root.toggleAttribute("data-offscreen", !entry.isIntersecting)
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const setSlideRef = <K extends keyof SlideRefs>(
    index: number,
    key: K,
    el: SlideRefs[K]
  ) => {
    assignSlideRef(slideRefs.current, index, key, el)
  }

  useGSAP(
    () => {
      const root = rootRef.current
      const wheel = wheelRef.current
      if (!root || !wheel || !ready) return
      if (!areSlideRefsReady(slideRefs.current, SLIDE_COUNT)) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          enabled: match,
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        // Use matchMedia's own contextSafe: wrapping with the outer useGSAP
        // context and calling it while this one is active makes the two
        // contexts contain each other, and revert() then recurses forever.
        (context, mmContextSafe) => {
          if (!context.conditions?.enabled || !mmContextSafe) return

          return setupAboutScroll({
            root,
            wheel,
            tickWheel: tickWheelRef.current,
            outerRing: outerRingRef.current,
            innerRing: innerRingRef.current,
            progressArc: progressRef.current,
            progressSpin: progressSpinRef.current,
            needle: needleRef.current,
            indexEl: indexRef.current,
            liveEl: liveRef.current,
            refs: slideRefs.current,
            contextSafe: (fn) => mmContextSafe(fn) as typeof fn,
            reduceMotion: Boolean(context.conditions.reduceMotion),
            maxRotation,
            tangentFaces,
            angleSign,
            skipIntro,
            lightMotion,
            scrub,
            stepped,
            onSlideChange: options?.onSlideChange,
          })
        }
      )

      return () => mm.revert()
    },
    {
      scope: rootRef,
      dependencies: [
        ready,
        match,
        maxRotation,
        tangentFaces,
        angleSign,
        skipIntro,
        lightMotion,
        scrub,
        stepped,
      ],
      revertOnUpdate: true,
    }
  )

  return {
    rootRef,
    wheelRef,
    tickWheelRef,
    outerRingRef,
    innerRingRef,
    progressRef,
    progressSpinRef,
    needleRef,
    indexRef,
    liveRef,
    setSlideRef,
  }
}
