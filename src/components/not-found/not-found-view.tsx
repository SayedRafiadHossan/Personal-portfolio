"use client"

import { TextReveal } from "@/components/animation"
import {
  attachFallingMedia,
  fallingMediaSources,
} from "@/components/not-found/falling-media"
import { NotFoundBlob } from "@/components/not-found/not-found-blob"
import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from "@/components/ui/button"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { useLenis } from "lenis/react"
import Link from "next/link"
import { useEffect, useRef } from "react"

gsap.registerPlugin(useGSAP, CustomEase)

export const NotFoundView = () => {
  const rootRef = useRef<HTMLElement>(null)
  const mascotRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()

  useEffect(() => {
    lenis?.stop()
    return () => {
      lenis?.start()
    }
  }, [lenis])

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current
      const mascot = mascotRef.current
      const actions = actionsRef.current
      if (!root || !mascot || !actions) return

      if (!CustomEase.get("bouncy-ease")) {
        CustomEase.create("bouncy-ease", "0.34, 1.42, 0.64, 1")
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches

      gsap.set(mascot, {
        autoAlpha: 0,
        scale: 0.92,
        transformOrigin: "50% 50%",
      })
      gsap.set(actions, { autoAlpha: 0, y: 16 })

      if (reduceMotion) {
        gsap.set(mascot, { autoAlpha: 1, scale: 1 })
        gsap.set(actions, { autoAlpha: 1, y: 0 })
        return
      }

      const tl = gsap.timeline()

      tl.to(mascot, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        ease: "power3.out",
      })

      tl.to(
        actions,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
        },
        0.35
      )

      if (!contextSafe) return

      return attachFallingMedia(root, fallingMediaSources, contextSafe)
    },
    { scope: rootRef }
  )

  return (
    <section
      ref={rootRef}
      data-not-found-page
      className="fixed inset-0 z-10 touch-none overflow-hidden bg-white text-background-1"
    >
      <div className="pointer-events-none h-full space-y-10 max-md:mt-20">
        <div ref={mascotRef} className="relative z-1 opacity-0">
          <NotFoundBlob />
        </div>

        <div className="relative z-1 space-y-5 text-center">
          <TextReveal scroll={false} delay={0.15}>
            <h1 className="text-center font-aspekta-950 text-aspekta-heading-3 md:text-aspekta-heading-1">
              404
            </h1>
          </TextReveal>
          <TextReveal scroll={false} delay={0.28}>
            <p className="font-instrument-serif text-instrument-heading-6 text-background-1/55 max-md:mx-2 md:text-instrument-heading-5">
              This page doesn&apos;t exist. It may have moved, or the link is
              wrong.
            </p>
          </TextReveal>
        </div>

        <div
          ref={actionsRef}
          className="pointer-events-auto relative z-20 flex flex-col items-center gap-4 opacity-0"
        >
          <FlipButton from="top" asChild>
            <Link href="/">
              <FlipButtonFront variant="default">Back home</FlipButtonFront>
              <FlipButtonBack variant="inverse">Back home</FlipButtonBack>
            </Link>
          </FlipButton>
        </div>
      </div>
    </section>
  )
}
