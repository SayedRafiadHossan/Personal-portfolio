"use client"

import gsap from "gsap"
import Image from "next/image"
import { useEffect, useRef, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"

/** Gap between the cursor and the bottom edge of the card. */
const OFFSET = 14
/** Max lean in degrees while the cursor is moving sideways. */
const MAX_LEAN = 6

const noopSubscribe = () => () => {}

type HeroLinkPreviewProps = Readonly<{
  /** Links matching this selector open the preview while hovered. */
  selector: string
  src: string
  alt: string
}>

/**
 * A 200px card that grows out of the cursor, sits just above it while a matching link is hovered
 * and follows it around. Listeners are delegated from the document because the
 * bio's line split rebuilds the link's DOM.
 */
export const HeroLinkPreview = ({ selector, src, alt }: HeroLinkPreviewProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  // The hero content is transformed, which would trap a fixed card; render it on body.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )

  useEffect(() => {
    const card = cardRef.current
    if (!card || !window.matchMedia("(pointer: fine)").matches) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const follow = { duration: reduced ? 0 : 0.55, ease: "power3.out" }
    const x = gsap.quickTo(card, "x", follow)
    const y = gsap.quickTo(card, "y", follow)
    const lean = gsap.quickTo(card, "rotation", { duration: 0.6, ease: "power3.out" })

    gsap.set(card, { autoAlpha: 0, scale: 0 })

    let open = false
    let lastX = 0
    let lastY = 0

    // Pin the scale origin to the cursor, so the card grows out of and shrinks back into it
    const originAtCursor = () => {
      const ox = lastX - Number(gsap.getProperty(card, "x"))
      const oy = lastY - Number(gsap.getProperty(card, "y"))
      gsap.set(card, { transformOrigin: `${ox}px ${oy}px` })
    }

    const place = (e: PointerEvent, immediate = false) => {
      const w = card.offsetWidth
      const h = card.offsetHeight
      const tx = gsap.utils.clamp(12, window.innerWidth - w - 12, e.clientX - w / 2)
      const ty = Math.max(12, e.clientY - h - OFFSET)
      if (immediate) {
        gsap.set(card, { x: tx, y: ty })
        x(tx, tx)
        y(ty, ty)
      } else {
        x(tx)
        y(ty)
      }
    }

    const show = (e: PointerEvent) => {
      open = true
      lastX = e.clientX
      lastY = e.clientY
      place(e, true)
      originAtCursor()
      gsap.to(card, {
        autoAlpha: 1,
        scale: 1,
        duration: reduced ? 0 : 0.5,
        ease: "back.out(1.4)",
        overwrite: "auto",
      })
    }

    const hide = () => {
      open = false
      lean(0)
      originAtCursor()
      gsap.to(card, {
        autoAlpha: 0,
        scale: 0,
        duration: reduced ? 0 : 0.3,
        ease: "power3.in",
        overwrite: "auto",
      })
    }

    const onMove = (e: PointerEvent) => {
      const over = (e.target as Element | null)?.closest?.(selector)
      if (!over && open) {
        lastX = e.clientX
        lastY = e.clientY
      }
      if (over && !open) show(e)
      else if (!over && open) hide()
      if (!open) return

      place(e)
      if (!reduced) {
        lean(gsap.utils.clamp(-MAX_LEAN, MAX_LEAN, (e.clientX - lastX) * 0.6))
      }
      lastX = e.clientX
      lastY = e.clientY
    }

    const onScroll = () => open && hide()

    document.addEventListener("pointermove", onMove)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      document.removeEventListener("pointermove", onMove)
      window.removeEventListener("scroll", onScroll)
      gsap.killTweensOf(card)
    }
  }, [selector, mounted])

  if (!mounted) return null

  return createPortal(
    <div
      ref={cardRef}
      aria-hidden
      className="pointer-events-none invisible fixed top-0 left-0 z-50 size-[200px] overflow-hidden rounded-xl bg-background-1 opacity-0 shadow-[0_2px_4px_rgb(0_0_0/0.06),0_32px_64px_-16px_rgb(0_0_0/0.3)] ring-1 ring-background-1/10"
    >
      <Image
        src={src}
        alt={alt}
        width={400}
        height={400}
        sizes="200px"
        className="size-full object-cover object-top"
      />
    </div>,
    document.body
  )
}
