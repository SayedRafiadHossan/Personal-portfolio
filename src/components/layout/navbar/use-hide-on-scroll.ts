"use client"

import gsap from "gsap"
import { useLenis } from "lenis/react"
import { useEffect, useRef, type RefObject } from "react"

/** Scroll delta per frame (px) before the nav reacts, so jitter is ignored. */
const SCROLL_THRESHOLD = 2
/** Always keep the nav visible this close to the top of the page. */
const TOP_ZONE = 80
/** Extra distance past the viewport edge so shadows/outlines clear it too. */
const EDGE_GAP = 24

/**
 * Slides `[data-nav-slide="left|right"]` children of the header off their
 * screen edge while scrolling down, and back in on any scroll up.
 */
export function useHideOnScroll(
  headerRef: RefObject<HTMLElement | null>,
  forceShow: boolean
) {
  const hiddenRef = useRef(false)
  const lastScrollRef = useRef(0)

  const setHidden = (hidden: boolean) => {
    const header = headerRef.current
    if (!header || hiddenRef.current === hidden) return
    hiddenRef.current = hidden

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    header.querySelectorAll<HTMLElement>("[data-nav-slide]").forEach((el) => {
      // offset* ignores transforms, so this is the element's resting position.
      const offset =
        el.dataset.navSlide === "left"
          ? -(el.offsetLeft + el.offsetWidth + EDGE_GAP)
          : header.offsetWidth - el.offsetLeft + EDGE_GAP

      gsap.to(el, {
        x: hidden ? offset : 0,
        duration: reduceMotion ? 0 : hidden ? 0.5 : 0.6,
        ease: hidden ? "power3.in" : "power3.out",
        overwrite: "auto",
      })
    })
  }

  useLenis(
    (lenis) => {
      const scroll = lenis.scroll
      const delta = scroll - lastScrollRef.current
      lastScrollRef.current = scroll

      if (forceShow || scroll < TOP_ZONE) {
        setHidden(false)
      } else if (delta > SCROLL_THRESHOLD) {
        setHidden(true)
      } else if (delta < -SCROLL_THRESHOLD) {
        setHidden(false)
      }
    },
    [forceShow]
  )

  useEffect(() => {
    if (forceShow) setHidden(false)
  }, [forceShow]) // eslint-disable-line react-hooks/exhaustive-deps

  // Tabbing into a hidden nav brings it back.
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const show = () => setHidden(false)
    header.addEventListener("focusin", show)
    return () => header.removeEventListener("focusin", show)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
