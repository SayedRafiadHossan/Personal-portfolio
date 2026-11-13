"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLenis } from "lenis/react"
import { useEffect, useRef, type RefObject } from "react"

gsap.registerPlugin(useGSAP, CustomEase, ScrollTrigger)

export type NavbarRefs = Readonly<{
  main: RefObject<HTMLDivElement | null>
  menu: RefObject<HTMLElement | null>
  overlay: RefObject<HTMLDivElement | null>
  dark: RefObject<HTMLDivElement | null>
  border: RefObject<HTMLDivElement | null>
  bars: RefObject<(HTMLElement | null)[]>
  largeItems: RefObject<(HTMLElement | null)[]>
  smallItems: RefObject<(HTMLElement | null)[]>
  corners: RefObject<(HTMLElement | null)[]>
  borderRows: RefObject<(HTMLElement | null)[]>
}>

type UseNavbarOptions = Readonly<{
  isOpen: boolean
  refs: NavbarRefs
  pendingHashRef: RefObject<string | null>
}>

type MotionScale = Readonly<{
  reduceMotion: boolean
  dur: number
  durShort: number
  durTiny: number
}>

type TimelineTargets = Readonly<{
  mainEl: HTMLElement
  overlayEl: HTMLElement
  darkEl: HTMLElement | null
  corners: HTMLElement[]
  overlayBorders: HTMLElement[]
  toggleBars: HTMLElement[]
  largeItems: HTMLElement[]
  smallItems: HTMLElement[]
  menuBorder: HTMLElement | null
  getMenuOffset: () => number
}>

const compact = <T>(items: (T | null | undefined)[]) =>
  items.filter((item): item is T => item != null)

const motionScale = (reduceMotion: boolean): MotionScale => ({
  reduceMotion,
  dur: reduceMotion ? 0.01 : 0.7,
  durShort: reduceMotion ? 0.01 : 0.5,
  durTiny: reduceMotion ? 0.01 : 0.35,
})

const addOpenTweens = (
  tl: gsap.core.Timeline,
  t: TimelineTargets,
  m: MotionScale
) => {
  tl.set(t.overlayEl, { visibility: "visible", pointerEvents: "auto" }, 0)
    .to(
      [t.mainEl, t.overlayEl],
      { x: t.getMenuOffset, duration: m.dur, force3D: true },
      0
    )
    .to(t.darkEl, { autoAlpha: 1, duration: m.durShort }, 0)
    .to(t.corners, { scale: 1, duration: m.durShort }, 0)
    .to(t.overlayBorders, { yPercent: 0, duration: m.durShort }, 0)
    .to(
      t.toggleBars[0],
      {
        y: "0.25em",
        rotation: 45,
        duration: m.durTiny,
        ease: m.reduceMotion ? "none" : "back.out(1.4)",
        easeReverse: "power3.out",
      },
      m.reduceMotion ? 0 : 0.05
    )
    .to(
      t.toggleBars[1],
      {
        y: "-0.25em",
        rotation: -45,
        duration: m.durTiny,
        ease: m.reduceMotion ? "none" : "back.out(1.4)",
        easeReverse: "power3.out",
      },
      m.reduceMotion ? 0 : 0.05
    )
    .fromTo(
      t.largeItems,
      { autoAlpha: 0, xPercent: 18 },
      {
        autoAlpha: 1,
        xPercent: 0,
        duration: m.dur,
        stagger: m.reduceMotion ? 0 : 0.05,
        force3D: true,
      },
      0
    )
    .fromTo(
      t.smallItems,
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: m.reduceMotion ? 0.01 : 0.55,
        stagger: m.reduceMotion ? 0 : 0.04,
        ease: m.reduceMotion ? "none" : "power3.out",
        force3D: true,
      },
      m.reduceMotion ? 0 : 0.28
    )

  if (t.menuBorder) {
    tl.to(t.menuBorder, { scaleX: 1, duration: m.durShort }, "<")
  }
}

const addCloseTweens = (
  tl: gsap.core.Timeline,
  t: TimelineTargets,
  m: MotionScale
) => {
  tl.to(
    t.largeItems,
    {
      autoAlpha: 0,
      xPercent: 10,
      duration: m.reduceMotion ? 0.01 : 0.28,
      ease: "power2.in",
      stagger: m.reduceMotion ? 0 : 0.02,
    },
    "<"
  )
    .to(
      t.smallItems,
      {
        autoAlpha: 0,
        y: 12,
        duration: m.reduceMotion ? 0.01 : 0.28,
        ease: "power2.in",
        stagger: m.reduceMotion ? 0 : 0.02,
      },
      "<"
    )
    .to(
      [t.mainEl, t.overlayEl],
      { x: 0, duration: m.reduceMotion ? 0.01 : 0.6, force3D: true },
      "<"
    )
    .to(
      t.darkEl,
      {
        autoAlpha: 0,
        duration: m.reduceMotion ? 0.01 : 0.35,
        ease: "power2.inOut",
      },
      "<"
    )
    .to(t.corners, { scale: 0, duration: m.durShort }, "<")
    .to(t.overlayBorders[0], { yPercent: -100, duration: m.durShort }, "<")
    .to(t.overlayBorders[1], { yPercent: 100, duration: m.durShort }, "<")
    .to(
      t.toggleBars,
      {
        y: 0,
        rotation: 0,
        duration: m.reduceMotion ? 0.01 : 0.35,
        ease: "power2.inOut",
      },
      "<"
    )

  if (t.menuBorder) {
    tl.to(
      t.menuBorder,
      { scaleX: 0, duration: m.reduceMotion ? 0.01 : 0.3 },
      "<"
    )
  }

  tl.set(t.overlayEl, { visibility: "hidden", pointerEvents: "none" })
}

const readTargets = (refs: NavbarRefs): TimelineTargets | null => {
  const mainEl = refs.main.current
  const menuEl = refs.menu.current
  const overlayEl = refs.overlay.current
  if (!mainEl || !menuEl || !overlayEl) return null

  return {
    mainEl,
    overlayEl,
    darkEl: refs.dark.current,
    corners: compact(refs.corners.current),
    overlayBorders: compact(refs.borderRows.current),
    toggleBars: compact(refs.bars.current),
    largeItems: compact(refs.largeItems.current),
    smallItems: compact(refs.smallItems.current),
    menuBorder: refs.border.current,
    getMenuOffset: () => -menuEl.offsetWidth,
  }
}

export function useNavbar({ isOpen, refs, pendingHashRef }: UseNavbarOptions) {
  const lenis = useLenis()
  const lenisRef = useRef(lenis)

  useEffect(() => {
    lenisRef.current = lenis
  }, [lenis])

  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const enterEndTimeRef = useRef(0)
  const skipOpenEffectRef = useRef(true)

  useGSAP(() => {
    const targets = readTargets(refs)
    if (!targets) return

    if (!CustomEase.get("energy")) {
      CustomEase.create("energy", "M0,0 C0.32,0.72 0,1 1,1")
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    gsap.set(targets.overlayEl, { visibility: "hidden", pointerEvents: "none" })
    gsap.set(targets.darkEl, { autoAlpha: 0 })
    gsap.set(targets.toggleBars, { y: 0, rotation: 0 })
    if (targets.menuBorder) gsap.set(targets.menuBorder, { scaleX: 0 })
    if (targets.overlayBorders[0]) {
      gsap.set(targets.overlayBorders[0], { yPercent: -100 })
    }
    if (targets.overlayBorders[1]) {
      gsap.set(targets.overlayBorders[1], { yPercent: 100 })
    }
    gsap.set(targets.corners, { scale: 0 })
    gsap.set(targets.largeItems, { autoAlpha: 0, xPercent: 18, force3D: true })
    gsap.set(targets.smallItems, { autoAlpha: 0, y: 18, force3D: true })

    const settleClosed = () => {
      gsap.set(targets.overlayEl, {
        visibility: "hidden",
        pointerEvents: "none",
      })
      gsap.set([targets.mainEl, targets.overlayEl], { clearProps: "transform" })
      lenisRef.current?.start()
      ScrollTrigger.refresh()

      const hash = pendingHashRef.current
      if (!hash) return
      pendingHashRef.current = null
      lenisRef.current?.scrollTo(hash)
    }

    const tl = gsap.timeline({
      paused: true,
      defaults: {
        ease: CustomEase.get("energy") ? "energy" : "power3.out",
        easeReverse: "power2.inOut",
      },
      onComplete: settleClosed,
      onReverseComplete: settleClosed,
    })

    addOpenTweens(tl, targets, motionScale(reduceMotion))
    enterEndTimeRef.current = tl.duration()
    tl.addPause()
    addCloseTweens(tl, targets, motionScale(reduceMotion))
    timelineRef.current = tl

    return () => {
      timelineRef.current = null
      lenisRef.current?.start()
    }
  })

  useGSAP(
    () => {
      const tl = timelineRef.current
      const mainEl = refs.main.current
      const overlayEl = refs.overlay.current
      if (tl == null || mainEl == null || overlayEl == null) return

      if (skipOpenEffectRef.current) {
        skipOpenEffectRef.current = false
        return
      }

      if (isOpen) {
        lenisRef.current?.stop()
        tl.invalidate()
        if (tl.time() >= enterEndTimeRef.current) {
          tl.timeScale(1).restart()
        } else {
          tl.timeScale(1).play()
        }
        return
      }

      if (tl.time() < enterEndTimeRef.current) {
        tl.timeScale(1).reverse()
      } else {
        tl.timeScale(1).play()
      }
    },
    { dependencies: [isOpen] }
  )

  useEffect(() => {
    if (isOpen) document.body.dataset.navStatus = "open"
    else delete document.body.dataset.navStatus

    return () => {
      delete document.body.dataset.navStatus
    }
  }, [isOpen])

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        const menuEl = refs.menu.current
        const mainEl = refs.main.current
        const overlayEl = refs.overlay.current
        const tl = timelineRef.current
        if (
          menuEl == null ||
          mainEl == null ||
          overlayEl == null ||
          tl == null
        ) {
          return
        }

        if (isOpen) gsap.set([mainEl, overlayEl], { x: -menuEl.offsetWidth })
        else tl.invalidate()
      }, 150)
    }

    window.addEventListener("resize", onResize)
    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener("resize", onResize)
    }
  }, [isOpen, refs])
}
