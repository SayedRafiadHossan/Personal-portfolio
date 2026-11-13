"use client"

import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import { Slot } from "@radix-ui/react-slot"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { useRef, type ComponentPropsWithoutRef, type ReactNode } from "react"

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger, CustomEase)

/** Sharp start, long glide: lines snap out of their masks and settle slowly. */
export const TEXT_REVEAL_EASE = "text-reveal"

export const ensureTextRevealEase = () => {
  if (!CustomEase.get(TEXT_REVEAL_EASE)) {
    CustomEase.create(TEXT_REVEAL_EASE, "0.4,0,0,1")
  }
  return TEXT_REVEAL_EASE
}

/** Lines rise out of their masks on a slight diagonal, alternating sides. */
export const textRevealFrom = (line: (index: number) => number = (i) => i) => ({
  yPercent: 100,
  xPercent: (index: number) => (line(index) % 2 ? -5 : 5),
})

export const textRevealTo = {
  yPercent: 0,
  xPercent: 0,
  force3D: true,
}

export const TEXT_REVEAL_DURATION = 1
export const TEXT_REVEAL_STAGGER = 0.115

type TextRevealOwnProps = {
  asChild?: boolean
  duration?: number
  delay?: number
  stagger?: number
  start?: string
  ease?: string
  scroll?: boolean
  children?: ReactNode
  className?: string
}

export type TextRevealProps = Readonly<
  TextRevealOwnProps &
    Omit<ComponentPropsWithoutRef<"span">, keyof TextRevealOwnProps>
>

/**
 * Splits into masked lines that rise into place (drifting in from alternating
 * sides) as the text enters the viewport,
 * and drop back once it is scrolled below the fold again so the reveal replays.
 */
export const TextReveal = ({
  asChild = true,
  duration = TEXT_REVEAL_DURATION,
  delay = 0,
  stagger = TEXT_REVEAL_STAGGER,
  start = "top 92%",
  ease,
  scroll = true,
  className,
  children,
  ...props
}: TextRevealProps) => {
  const rootRef = useRef<HTMLElement>(null)
  const Comp = asChild ? Slot : "span"

  useGSAP(
    () => {
      const el = rootRef.current
      if (!el) return

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { opacity: 1 })
        return
      }

      const revealEase = ease ?? ensureTextRevealEase()

      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        tag: "span",
        linesClass: "text-reveal-line",
        // Lines keep whole words, so screen readers read them as-is; the default
        // aria-label it would add is not allowed on <p>.
        aria: "none",
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { opacity: 1 })
          return gsap.fromTo(self.lines, textRevealFrom(), {
            ...textRevealTo,
            duration,
            stagger,
            delay,
            ease: revealEase,
            ...(scroll
              ? {
                  scrollTrigger: {
                    trigger: el,
                    start,
                    toggleActions: "play none none reset",
                  },
                }
              : {}),
          })
        },
      })
    },
    {
      scope: rootRef,
      dependencies: [duration, delay, stagger, start, ease, scroll],
    }
  )

  return (
    <Comp ref={rootRef} data-text-reveal className={cn(className)} {...props}>
      {children}
    </Comp>
  )
}
